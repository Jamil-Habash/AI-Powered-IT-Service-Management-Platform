package com.smartdesk.project.service;

import com.smartdesk.project.dto.request.ChatRequest;
import com.smartdesk.project.dto.request.CreateTicketFromChatRequest;
import com.smartdesk.project.dto.request.CreateTicketRequest;
import com.smartdesk.project.dto.response.ChatMessageResponse;
import com.smartdesk.project.dto.response.ChatResponse;
import com.smartdesk.project.dto.response.TicketResponse;
import com.smartdesk.project.exception.ExceptionsHandler.ResourceNotFoundException;
import com.smartdesk.project.models.ChatConversation;
import com.smartdesk.project.models.ChatMessage;
import com.smartdesk.project.models.ChatRole;
import com.smartdesk.project.repository.ChatConversationRepository;
import com.smartdesk.project.repository.ChatMessageRepository;
import com.smartdesk.project.security.UserPrincipal;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final String SYSTEM_PROMPT = """
            You are the SmartDesk AI Assistant, built into an IT service management platform.
            Help the employee describe their technical issue clearly. Ask short clarifying
            questions if the issue is vague (e.g. which device, when it started, error messages).
            Once you have enough detail, suggest that they create a ticket, and propose a concise
            title, category (Network, Software, Hardware, Account, Security, or Other), and a
            clear description they could use. Keep responses brief and friendly, like a helpful
            IT colleague, not a formal support script.
            """;

    private final ChatClient chatClient;
    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final TicketService ticketService;

    public ChatService(ChatClient.Builder chatClientBuilder,
                        ChatConversationRepository conversationRepository,
                        ChatMessageRepository messageRepository,
                        TicketService ticketService) {
        this.chatClient = chatClientBuilder.build();
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.ticketService = ticketService;
    }

    @Transactional
    public ChatResponse chat(ChatRequest request, UserPrincipal currentUser) {
        ChatConversation conversation = resolveConversation(request.getConversationId(), currentUser);

        // Save the user's new message first
        messageRepository.save(new ChatMessage(conversation, ChatRole.USER, request.getMessage()));

        // Rebuild full history (including the message we just saved) for context
        List<ChatMessage> history = messageRepository.findByConversationOrderByCreatedAtAsc(conversation);

        List<Message> aiMessages = new ArrayList<>();
        aiMessages.add(new SystemMessage(SYSTEM_PROMPT));
        for (ChatMessage m : history) {
            if (m.getRole() == ChatRole.USER) {
                aiMessages.add(new UserMessage(m.getContent()));
            } else {
                aiMessages.add(new AssistantMessage(m.getContent()));
            }
        }

        String reply;
        try {
            reply = chatClient.prompt(new Prompt(aiMessages)).call().content();
        } catch (Exception e) {
            reply = "Sorry, I'm having trouble responding right now. You can still describe your issue and submit it as a ticket directly.";
        }

        messageRepository.save(new ChatMessage(conversation, ChatRole.ASSISTANT, reply));

        return new ChatResponse(conversation.getId(), reply);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getHistory(Long conversationId, UserPrincipal currentUser) {
        ChatConversation conversation = getOwnedConversation(conversationId, currentUser);
        return messageRepository.findByConversationOrderByCreatedAtAsc(conversation).stream()
                .map(ChatMessageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public TicketResponse createTicketFromChat(CreateTicketFromChatRequest request, UserPrincipal currentUser) {
        // Ownership check ensures a user can't create a ticket by referencing
        // someone else's conversation id.
        getOwnedConversation(request.getConversationId(), currentUser);

        CreateTicketRequest ticketRequest = new CreateTicketRequest();
        ticketRequest.setTitle(request.getTitle());
        ticketRequest.setDescription(request.getDescription());
        ticketRequest.setCategoryId(request.getCategoryId());

        return ticketService.create(ticketRequest, Collections.emptyList(), currentUser);
    }

    private ChatConversation resolveConversation(Long conversationId, UserPrincipal currentUser) {
        if (conversationId == null) {
            ChatConversation conversation = new ChatConversation();
            conversation.setUser(currentUser.getUser());
            return conversationRepository.save(conversation);
        }
        return getOwnedConversation(conversationId, currentUser);
    }

    private ChatConversation getOwnedConversation(Long conversationId, UserPrincipal currentUser) {
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));

        boolean isOwner = conversation.getUser() != null
                && conversation.getUser().getId().equals(currentUser.getUser().getId());

        if (!isOwner) {
            // Same "hide existence" pattern as tickets/comments: don't reveal
            // that a conversation with this id exists if it isn't theirs.
            throw new ResourceNotFoundException("Conversation not found: " + conversationId);
        }
        return conversation;
    }
}
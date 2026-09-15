package com.smartdesk.project.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartdesk.project.dto.response.AIAnalysisResponse;
import com.smartdesk.project.models.Priority;
import com.smartdesk.project.models.Ticket;
import com.smartdesk.project.repository.TicketRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AIAnalysisService {

    private final ChatClient chatClient;
    private final TicketRepository ticketRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AIAnalysisService(ChatClient.Builder chatClientBuilder, TicketRepository ticketRepository) {
        this.chatClient = chatClientBuilder.build();
        this.ticketRepository = ticketRepository;
    }

    @Async
    @Transactional
    public void analyzeTicketAsync(Long ticketId) {
        System.out.println(">>> AI analysis STARTED for ticket " + ticketId);
        try {
            Ticket ticket = ticketRepository.findById(ticketId).orElse(null);
            if (ticket == null) 
                return;

            String prompt = buildPrompt(ticket.getTitle(), ticket.getDescription());
            String rawResponse = chatClient.prompt().user(prompt).call().content();

            String json = extractJson(rawResponse);
            AIAnalysisResponse result = objectMapper.readValue(json, AIAnalysisResponse.class);

            ticket.setAiSummary(result.getSummary());
            ticket.setAiSuggestedCategory(result.getCategory());
            ticket.setAiSuggestedActions(String.join("\n", result.getSuggestedActions()));

            try {
                ticket.setAiSuggestedPriority(Priority.valueOf(result.getPriority().toUpperCase()));
            } catch (Exception ignored) {
                System.out.println(">>> AI analysis FAILED for ticket " + ticketId);
            }

            ticketRepository.save(ticket);
            System.out.println(">>> AI analysis SUCCEEDED for ticket " + ticketId + ": " + result.getSummary());

        } catch (Exception e) {
            System.out.println(">>> AI analysis FAILED for ticket " + ticketId + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String buildPrompt(String title, String description) {
        return """
                You are an IT support triage assistant. Analyze this support ticket and respond with ONLY a JSON object, no other text, no markdown formatting.

                Ticket title: %s
                Ticket description: %s

                Respond with exactly this JSON structure:
                {
                  "category": "one of: Network, Software, Hardware, Account, Security, Other",
                  "priority": "one of: LOW, MEDIUM, HIGH, CRITICAL",
                  "summary": "a one-sentence summary of the issue",
                  "suggestedActions": ["short action 1", "short action 2", "short action 3"]
                }
                """.formatted(title, description);
    }

    private String extractJson(String raw) {
        String cleaned = raw.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("```json", "").replaceAll("```", "").trim();
        }
        return cleaned;
    }
}
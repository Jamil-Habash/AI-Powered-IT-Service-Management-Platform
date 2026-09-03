package com.smartdesk.project.exception;

public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String email) {
        super("An account with email '" + email + "' already exists");
    }
}
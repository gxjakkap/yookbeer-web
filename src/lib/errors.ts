/**
 * Shamelessly borrowed from gxjakkap/cc36staffapp
 * 
 * Original author: beambeambeam
 */

export class PublicError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class AuthenticationError extends PublicError {
    constructor() {
        super("You must be logged in to view this content");
        this.name = "AuthenticationError";
    }
}

export class ForbiddenError extends PublicError {
    constructor() {
        super("You do not have permission to perform this action");
        this.name = "ForbiddenError";
    }
}
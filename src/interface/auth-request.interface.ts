import { IncomingMessage } from "http";

export interface IAuthenticatedRequest extends IncomingMessage {
    headers: {
      authorization?: string;
    };
  }
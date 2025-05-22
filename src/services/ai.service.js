"use strict";

const {
  services: {
    ai: { baseUrl },
  },
} = require("../config/config.app");
const { BadRequestError, InternalServerError } = require("../core/error.response");

class AIService {
  static chat = async ({ prompt, conversationId, userId, context }) => {
    if (!prompt) {
      throw new BadRequestError("Missing required param: prompt");
    }

    try {
      const res = await fetch(`${baseUrl}/api/v1/chatbot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
          conversation_id: conversationId || null,
          user_id: userId || null,
          context: context || null,
        }),
      });

      if (!res.ok) {
        throw new InternalServerError("Failed to fetch data from AI service");
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return {
        reply: data?.reply || "No reply",
        conversationId: data?.conversation_id,
      };
    } catch (error) {
      return { reply: "Sorry, I'm having trouble responding right now." };
    }
  };
}

module.exports = AIService;

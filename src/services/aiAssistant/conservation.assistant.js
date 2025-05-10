"use strict";

const AIService = require("../ai.service");
const { MessageModel, TextMessageModel } = require("../../models/message.model");
const { Types } = require("mongoose");
const ConservationRepository = require("../../models/repositories/conservation.repository");

const AI_ASSISTANT_ID = new Types.ObjectId("000000000000000000000000");

const eventNames = {
  NEW_MESSAGE: "messages/new",
  CONSERVATION_UPDATE: "conservation/update",
  AI_TYPING_INDICATOR: "ai/typing",
};

class ConservationAssistant {
  static async processMessage(message, conservationId) {
    try {
      if (message.isBot) return null;

      const messageText = message.content.text.toLowerCase();
      const containsQuestion = messageText.includes("?");
      const isAssistantMention =
        messageText.includes("@assistant") || messageText.includes("assistant");

      if (!containsQuestion && !isAssistantMention) return null;

      const userId = typeof message.sender === "object" ? message.sender._id.toString() : null;
      const userName =
        typeof message.sender === "object" ? message.sender.userName || "User" : "User";

      if (global._io) {
        global._io.to(conservationId.toString()).emit(eventNames.AI_TYPING_INDICATOR, {
          conservationId: conservationId.toString(),
          isTyping: true,
        });
      }

      try {
        const recentMessages = await MessageModel.find({
          conservation: conservationId,
          _id: { $ne: message._id },
          isDeleted: { $ne: true },
        })
          .sort({ createdAt: -1 })
          .limit(20)
          .populate("sender", "userName email")
          .lean();

        const conversationContext = recentMessages
          .reverse()
          .map((msg) => {
            const senderName = msg.isBot
              ? "Assistant"
              : typeof msg.sender === "object"
              ? msg.sender.userName || "User"
              : "User";

            let content = "[media content]";
            if (msg.type === "text" && msg.content && msg.content.text) {
              content = msg.content.text;
            }

            return `${senderName}: ${content}`;
          })
          .join("\n");

        const currentContext = `${conversationContext}\n\n${userName}: ${message.content.text}`;

        const aiResponse = await AIService.chat({
          prompt: message.content.text,
          conversationId: conservationId.toString(),
          userId,
          context: currentContext,
        });

        if (!aiResponse || !aiResponse.reply) {
          if (global._io) {
            global._io.to(conservationId.toString()).emit(eventNames.AI_TYPING_INDICATOR, {
              conservationId: conservationId.toString(),
              isTyping: false,
            });
          }
          console.error("No response from AI service");
          return null;
        }

        const messageId = new Types.ObjectId();

        await TextMessageModel.create({
          _id: messageId,
          text: aiResponse.reply,
          sender: AI_ASSISTANT_ID,
        });

        await MessageModel.create({
          _id: messageId,
          sender: AI_ASSISTANT_ID,
          conservation: conservationId,
          type: "text",
          content: { text: aiResponse.reply },
          isBot: true,
        });

        const createdMessage = await MessageModel.findById(messageId).lean();

        createdMessage.sender = {
          _id: AI_ASSISTANT_ID,
          userName: "AI Assistant",
          email: "ai@assistant.com",
          photo: null,
        };

        createdMessage.isAI = true;

        await ConservationRepository.updateConservationById({
          conservationId: conservationId.toString(),
          updatedPart: {
            lastMessage: messageId,
          },
        });

        if (global._io) {
          global._io.to(conservationId.toString()).emit(eventNames.NEW_MESSAGE, createdMessage);

          const conservation = await ConservationRepository.getConservationById(conservationId);
          if (conservation) {
            conservation.members
              .map((m) => m.user.toString())
              .forEach((uid) => {
                global._io.to(uid).emit(eventNames.CONSERVATION_UPDATE, [
                  {
                    _id: conservationId.toString(),
                    updated: { lastMessage: createdMessage },
                  },
                ]);
              });
          }

          global._io.to(conservationId.toString()).emit(eventNames.AI_TYPING_INDICATOR, {
            conservationId: conservationId.toString(),
            isTyping: false,
          });
        }

        return createdMessage;
      } catch (error) {
        if (global._io) {
          global._io.to(conservationId.toString()).emit(eventNames.AI_TYPING_INDICATOR, {
            conservationId: conservationId.toString(),
            isTyping: false,
          });
        }
        console.error("AI message creation error:", error);
        return null;
      }
    } catch (error) {
      if (global._io) {
        global._io.to(conservationId.toString()).emit(eventNames.AI_TYPING_INDICATOR, {
          conservationId: conservationId.toString(),
          isTyping: false,
        });
      }
      console.error("AI Assistant error:", error);
      return null;
    }
  }
}

module.exports = ConservationAssistant;

import React from 'react';
import type { ChatMessage } from '../../types';
import { AssistantMessage } from './AssistantMessage';
import { TypingIndicator } from './TypingIndicator';

interface AssistantChatProps {
  messages: ChatMessage[];
  isTyping: boolean;
  chatBottomRef: React.RefObject<HTMLDivElement | null>;
}

export const AssistantChat: React.FC<AssistantChatProps> = React.memo(({
  messages,
  isTyping,
  chatBottomRef,
}) => {
  return (
    <div className="space-y-4 pt-2">
      {messages.map((msg) => (
        <AssistantMessage key={msg.id} message={msg} />
      ))}

      {isTyping && <TypingIndicator />}

      <div ref={chatBottomRef} />
    </div>
  );
});

AssistantChat.displayName = 'AssistantChat';

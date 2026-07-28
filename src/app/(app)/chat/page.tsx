import { DisclaimerBanner } from "@/components/chat/DisclaimerBanner";
import { EmergencyNotice } from "@/components/chat/EmergencyNotice";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default function ChatHomePage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <EmergencyNotice />
      <DisclaimerBanner />
      <ChatWindow conversationId={null} initialMessages={[]} />
    </div>
  );
}

export default function MessageBubble({
  content,
  isMe,
}: {
  content: string;
  isMe: boolean;
}) {
  return (
    <div
      className={`max-w-xs px-3 py-2 rounded-lg ${
        isMe
          ? "bg-blue-500 text-white self-end ml-auto"
          : "bg-gray-200 text-black"
      }`}
    >
      {content}
    </div>
  );
}

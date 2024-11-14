interface MessageData {
  userName: string;
  message: string;
}

export function Message({ userName, message }: MessageData) {
  return (
    <div className="text-sm pb-4">
      <span className="text-brand mr-4">{userName}</span>
      <span className="text-grayscale-100">{message}</span>
    </div>
  );
}

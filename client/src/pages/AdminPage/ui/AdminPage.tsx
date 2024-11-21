import { Button } from '@/shared/ui';
import { AlbumForm, SongForm } from '@/features/albumRegister';
import { useAlbumForm } from '@/features/albumRegister/model/useAlbumForm';
import { useStreamingRoom } from '@/shared/hook/useStreamingRoom';
import { socket } from '@/shared/api/socket';

export function AdminPage() {
  const { isConnected } = useStreamingRoom();

  const { handleSubmit, handleAddSong, songs, songFormRef, albumFormRef } =
    useAlbumForm();

  const handlePost = async () => {
    if (!albumFormRef.current || songs.length === 0) return;
    await handleSubmit();
    albumFormRef.current.reset();
  };

  const handleCreateRoom = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('createRoom');
    socket.emit('createRoom', { userId: 'TEMP_USER_ID' }, (response: any) => {
      console.log('createRoom', response);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full h-fit max-w-5xl grid grid-cols-6 gap-6">
        <AlbumForm albumFormRef={albumFormRef} />
        <SongForm songFormRef={songFormRef} />
        <div className="col-span-2 flex flex-col gap-4">
          <label className="text-grayscale-100 text-sm">목록</label>
          <ul className="h-full text-grayscale-100 overflow-y-auto">
            {songs.map((song, index) => (
              <li key={index} className="py-2 border-b border-gray-200">
                {index + 1}. {song.title}
              </li>
            ))}
          </ul>
          <div className="flex flex-row gap-4">
            <Button message="노래 추가" onClick={handleAddSong} />
            <Button message="방 만들기" onClick={handlePost} />
          </div>
          <Button message="초오고속 방 만들기" onClick={handleCreateRoom} />
        </div>
      </div>
    </div>
  );
}

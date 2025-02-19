import LogoAlbum from '@/assets/logo-album-cover.webp';
import { AlbumCard } from './AlbumCard';
import { useEffect, useState } from 'react';
import { EndedAlbumListResponse } from '@/entities/room/types';
import { publicAPI } from '@/shared/api/publicAPI';

export function AlbumList() {
  const [endedAlbumList, setEndedAlbumList] =
    useState<EndedAlbumListResponse>();

  useEffect(() => {
    const getAlbumEnded = async () => {
      const res = await publicAPI
        .getAlbumEnded()
        .then((res) => res)
        .catch((err) => console.log(err));
      setEndedAlbumList(res.result);
    };

    getAlbumEnded();
  }, []);

  if (!endedAlbumList) return null;
  return (
    <div className="text-grayscale-50">
      <p className="mt-[70px] mb-7 text-3xl font-bold">최근 등록된 앨범</p>
      <ul className="w-full grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 overflow-hidden gap-4">
        {endedAlbumList.endedAlbums.slice(0, 7).map((album) => (
          <li key={album.albumId}>
            <AlbumCard
              album={{
                albumId: album.albumId,
                albumName: album.albumName,
                artist: album.artist,
                albumTags: album.albumTags || '',
                jacketUrl: album.jacketUrl || LogoAlbum,
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

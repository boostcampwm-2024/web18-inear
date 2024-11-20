import { useCallback, useState, useRef } from 'react';
import { CreateAlbumRequest, Song } from './types';
import axios from 'axios';

const SONG_FIELDS = [
  'title',
  'composer',
  'writer',
  'producer',
  'instrument',
  'trackNumber',
  'source',
  'lyrics',
] as const;

const ALBUM_FIELDS = ['title', 'artist', 'albumTag', 'releaseDate'] as const;

function validateForm(formData: FormData, fields: readonly string[]) {
  return fields.every((field) => {
    const value = formData.get(field);
    return value !== null && value !== '';
  });
}

function createSongData(formData: FormData): Song {
  return SONG_FIELDS.reduce((acc, field) => {
    acc[field as keyof Song] = formData.get(field) as string;
    return acc;
  }, {} as Song);
}

function createAlbumData(
  formData: FormData,
  songs: Song[],
): CreateAlbumRequest {
  const albumData = ALBUM_FIELDS.reduce((acc, field) => {
    if (field === 'albumTag') {
      acc[field] = (formData.get(field) as string).split(',');
    } else {
      acc[field] = formData.get(field) as string;
    }
    return acc;
  }, {} as CreateAlbumRequest);

  albumData.songs = songs;
  return albumData;
}

function createSubmitFormData(
  albumData: CreateAlbumRequest,
  albumCover: File,
  bannerCover: File,
  songFiles: File[],
): FormData {
  const submitFormData = new FormData();
  submitFormData.append('albumData', JSON.stringify(albumData));
  submitFormData.append('albumCover', albumCover);
  submitFormData.append('bannerCover', bannerCover);
  songFiles.forEach((file) => {
    submitFormData.append('songs', file);
  });

  return submitFormData;
}

async function submitAlbumForm(submitFormData: FormData) {
  axios
    .post('http://localhost/api/admin/album', submitFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error('[ERROR] 앨범 등록 실패:', error);
      throw error;
    });
}

export function useAlbumForm() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [songFiles, setSongFiles] = useState<File[]>([]);
  const songFormRef = useRef<HTMLFormElement>(null);
  const albumFormRef = useRef<HTMLFormElement>(null);

  const handleAddSong = useCallback(() => {
    if (!songFormRef.current) return;

    const songFormData = new FormData(songFormRef.current);
    const songFile = songFormData.get('songFile') as File;

    // 필드가 비어있으면 경고창 띄우고 함수 종료
    if (!validateForm(songFormData, SONG_FIELDS) || !songFile.name) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    // FormData로부터 새로운 노래 객체 생성
    const newSong = createSongData(songFormData);

    // 노래 추가 및 파일 추가
    setSongs((prev) => [...prev, newSong as Song]);
    setSongFiles((prev) => [...prev, songFile]);

    // 폼 리셋
    songFormRef.current.reset();
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      const albumFormData = new FormData(
        albumFormRef.current as HTMLFormElement,
      );
      const albumData = createAlbumData(albumFormData, songs);

      const albumCover = albumFormData.get('albumCover') as File;
      const bannerCover = albumFormData.get('bannerCover') as File;

      const submitFormData = createSubmitFormData(
        albumData,
        albumCover,
        bannerCover,
        songFiles,
      );

      const response = submitAlbumForm(submitFormData);
      console.log(response);

      // 성공 시 모든 상태 초기화
      setSongs([]);
      setSongFiles([]);
    } catch (error) {
      console.error('[ERROR] 앨범 등록 실패:', error);
      throw error;
    }
  }, [songs, songFiles]);

  return { handleSubmit, handleAddSong, songs, songFormRef, albumFormRef };
}

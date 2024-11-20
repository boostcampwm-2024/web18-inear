import { MainPage } from '@/pages/MainPage';
import { StreamingPage } from '@/pages/StreamingPage';
import { Layout } from '@/Layout';
import { AdminPage } from '@/pages/AdminPage';
import { AlbumPage } from '@/pages/AlbumPage';
import { HlsTestPage } from '@/pages/HlsTestPage';

export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <MainPage />,
      },
      {
        path: '/streaming/:roomId',
        element: <StreamingPage />,
      },
      {
        path: '/album/:albumId',
        element: <AlbumPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminPage />,
  },
  {
    path: '/hls-test',
    element: <HlsTestPage />,
  },
];

import api from '../api';

export async function uploadPublicFile(file, folder = 'bk_awards') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const { data } = await api.post('/uploads/public', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return data;
}

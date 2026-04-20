export const emptySubject = { subject: '', marksObtained: '', maxMarks: 100 };

export const initialStudentForm = {
  fullName: '',
  mobile: '',
  parentMobile: '',
  schoolName: '',
  board: '',
  className: '',
  percentage: '',
  gender: 'Any',
  city: '',
  state: '',
  subjects: [{ ...emptySubject }],
  marksheetFileUrl: '',
  resultImageUrl: '',
  studentPhotoUrl: '',
  certificatePhotoUrl: '',
  remarks: '',
  certificateAdjustments: { photoScale: 1, photoRotation: 0, photoX: 0, photoY: 0 }
};

export const toStudentPayload = (form) => ({
  ...form,
  percentage: form.percentage === '' ? '' : Number(form.percentage),
  resultImageUrl: form.marksheetFileUrl || form.resultImageUrl || '',
  certificatePhotoUrl: form.studentPhotoUrl || form.certificatePhotoUrl || ''
});

export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const normalizeStudentForm = (data = {}) => ({
  ...initialStudentForm,
  ...data,
  percentage: data.percentage ?? '',
  subjects: data.subjects?.length ? data.subjects : [{ ...emptySubject }],
  certificateAdjustments: {
    ...initialStudentForm.certificateAdjustments,
    ...(data.certificateAdjustments || {})
  }
});

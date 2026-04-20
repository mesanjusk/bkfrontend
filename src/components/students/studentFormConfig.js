export const emptySubject = {
  subject: '',
  marksObtained: 0,
  maxMarks: 100
};

export function createInitialStudentForm() {
  return {
    fullName: '',
    gender: 'Any',
    address: '',
    mobile: '',
    parentMobile: '',
    categoryId: '',
    categoryOther: '',
    schoolName: '',
    className: '',
    percentage: 0,
    subjects: [{ ...emptySubject }],
    marksheetFileUrl: '',
    resultImageUrl: '',
    studentPhotoUrl: '',
    certificatePhotoUrl: '',
    remarks: '',
    board: '',
    certificateAdjustments: {
      photoScale: 1,
      photoX: 0,
      photoY: 0,
      photoRotation: 0
    }
  };
}

export function isOtherCategory(value) {
  return String(value || '') === 'OTHER';
}

export function getSelectedCategory(categories = [], categoryId = '') {
  return categories.find((c) => String(c._id) === String(categoryId)) || null;
}

export function getBoardFromCategory(category) {
  if (!category) return '';
  if (category.board) return category.board;
  const title = String(category.title || '').toUpperCase();
  if (title.includes('CBSE')) return 'CBSE';
  if (title.includes('STATE')) return 'STATE BOARD';
  return '';
}

export function isCbseCategory(category, form = {}) {
  const board = String(category?.board || form.board || '').toUpperCase();
  const title = String(category?.title || '').toUpperCase();
  return board === 'CBSE' || title.includes('CBSE');
}

export function calculateBest5Preview(subjects = []) {
  const valid = (subjects || [])
    .map((s) => ({
      subject: s.subject || '',
      marksObtained: Number(s.marksObtained || 0),
      maxMarks: Number(s.maxMarks || 100)
    }))
    .filter((s) => s.subject || s.marksObtained || s.maxMarks);

  const sorted = [...valid].sort((a, b) => b.marksObtained - a.marksObtained).slice(0, 5);
  const totalObtained = sorted.reduce((sum, s) => sum + Number(s.marksObtained || 0), 0);
  const totalMax = sorted.reduce((sum, s) => sum + Number(s.maxMarks || 0), 0);

  return {
    subjects: sorted,
    totalObtained,
    totalMax,
    percentage: totalMax ? (totalObtained / totalMax) * 100 : 0
  };
}

export function normalizeSubjects(subjects = []) {
  const cleaned = (subjects || [])
    .map((s) => ({
      subject: String(s.subject || '').trim(),
      marksObtained: Number(s.marksObtained || 0),
      maxMarks: Number(s.maxMarks || 100)
    }))
    .filter((s) => s.subject || s.marksObtained || s.maxMarks);

  return cleaned.length ? cleaned : [{ ...emptySubject }];
}

export function toStudentPayload(form, categories = []) {
  const selectedCategory = getSelectedCategory(categories, form.categoryId);
  const derivedBoard = getBoardFromCategory(selectedCategory);
  const cbse = isCbseCategory(selectedCategory, form);
  const normalizedSubjects = normalizeSubjects(form.subjects);
  const best5 = calculateBest5Preview(normalizedSubjects);

  let percentage = Number(form.percentage || 0);
  if ((!percentage || percentage === 0) && cbse && best5.totalMax > 0) {
    percentage = Number(best5.percentage.toFixed(2));
  }

  return {
    fullName: form.fullName || '',
    gender: form.gender || 'Any',
    address: form.address || '',
    mobile: form.mobile || '',
    parentMobile: form.parentMobile || '',

    categoryId: isOtherCategory(form.categoryId) ? 'OTHER' : (form.categoryId || ''),
    categoryOther: isOtherCategory(form.categoryId) ? (form.categoryOther || '') : '',

    schoolName: form.schoolName || '',
    className: form.className || '',
    percentage,
    subjects: cbse ? normalizedSubjects : normalizedSubjects,

    marksheetFileUrl: form.marksheetFileUrl || '',
    resultImageUrl: form.resultImageUrl || form.marksheetFileUrl || '',
    studentPhotoUrl: form.studentPhotoUrl || '',
    certificatePhotoUrl: form.studentPhotoUrl || form.certificatePhotoUrl || '',

    remarks: form.remarks || '',
    board: derivedBoard || form.board || '',

    certificateAdjustments: {
      photoScale: Number(form.certificateAdjustments?.photoScale ?? 1),
      photoX: Number(form.certificateAdjustments?.photoX ?? 0),
      photoY: Number(form.certificateAdjustments?.photoY ?? 0),
      photoRotation: Number(form.certificateAdjustments?.photoRotation ?? 0)
    }
  };
}

export const studentWizardSteps = [
  {
    key: 'personal',
    title: 'Personal Details',
    fields: ['fullName', 'gender', 'address', 'mobile', 'parentMobile']
  },
  {
    key: 'academic',
    title: 'Academic Info',
    fields: ['categoryId', 'categoryOther', 'schoolName', 'className', 'percentage', 'subjects']
  },
  {
    key: 'uploads',
    title: 'Uploads',
    fields: ['marksheetFileUrl', 'studentPhotoUrl', 'remarks']
  },
  {
    key: 'review',
    title: 'Review & Submit',
    fields: []
  }
];
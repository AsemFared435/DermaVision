export const getUncertaintyReasons = (reasons = [], confidencePercent = null) => {
  const list = Array.isArray(reasons) ? reasons : [];
  return [
    ...new Set([
      ...list,
      ...(Number(confidencePercent) < 60 ? ['low_confidence'] : []),
    ]),
  ];
};

export const getUncertaintyMessage = (reasons = [], isArabic = false) => {
  const reasonSet = new Set(Array.isArray(reasons) ? reasons : []);
  const hasPoorQuality = reasonSet.has('poor_image_quality');
  const hasLowConfidence = reasonSet.has('low_confidence');
  const hasAmbiguous = reasonSet.has('ambiguous_prediction');

  if (hasPoorQuality && reasonSet.size === 1) {
    return isArabic
      ? 'النتيجة غير مؤكدة لأن جودة الصورة منخفضة. من فضلك ارفع صورة جلد أوضح وبإضاءة جيدة وحاول مرة أخرى.'
      : 'The result is uncertain because the uploaded image quality is low. Please upload a clearer, well-lit skin image and try again.';
  }

  if (hasPoorQuality) {
    return isArabic
      ? 'النتيجة غير مؤكدة لأن جودة الصورة منخفضة ولأن توقع الموديل غير قوي. من فضلك ارفع صورة جلد أوضح، وإذا استمرت المشكلة يُفضل استشارة طبيب جلدية.'
      : 'The result is uncertain because the image quality is low and the model prediction is not confident. Please upload a clearer skin image. If the issue remains, consult a dermatologist.';
  }

  if (hasLowConfidence && hasAmbiguous) {
    return isArabic
      ? 'النتيجة غير مؤكدة لأن ثقة الموديل منخفضة ولأن أعلى التوقعات متقاربة. قد تكون الحالة غير واضحة أو خارج الأمراض المدعومة حاليًا، لذلك يُفضل استشارة طبيب جلدية.'
      : 'The result is uncertain because the model confidence is low and the top predictions are close to each other. This may indicate an ambiguous case or a disease outside the supported model classes. Please consult a dermatologist.';
  }

  if (hasLowConfidence) {
    return isArabic
      ? 'النتيجة غير مؤكدة لأن ثقة الموديل منخفضة. قد لا تكون الحالة مدعومة بوضوح ضمن الأمراض الحالية، لذلك يُفضل استشارة طبيب جلدية.'
      : 'The result is uncertain because the model confidence is low. This case may not be clearly supported by the current model classes. Please consult a dermatologist.';
  }

  if (hasAmbiguous) {
    return isArabic
      ? 'النتيجة غير مؤكدة لأن أعلى التوقعات متقاربة. قد تكون الحالة غير واضحة أو خارج الأمراض المدعومة حاليًا، لذلك يُفضل استشارة طبيب جلدية.'
      : 'The result is uncertain because the top predictions are close to each other. The case may be ambiguous or outside the supported diseases. Please consult a dermatologist.';
  }

  return isArabic
    ? 'النتيجة غير مؤكدة. يُفضل استشارة طبيب جلدية.'
    : 'The result is uncertain. Please consult a dermatologist.';
};

export const getUncertaintyReasonLabel = (reason, isArabic = false) => {
  const labels = {
    poor_image_quality: isArabic ? 'جودة صورة منخفضة' : 'Low image quality',
    low_confidence: isArabic ? 'ثقة منخفضة' : 'Low confidence',
    ambiguous_prediction: isArabic ? 'توقعات متقاربة' : 'Close predictions',
  };
  return labels[reason] || reason;
};

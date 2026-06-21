/**
 * Disease Database
 * بيانات كل مرض من الـ 6 أمراض اللي الـ Model بيتعرف عليهم
 * DISEASE_CLASSES = ['MF', 'annular lichen', 'healty', 'psoriasis', 'tinea circinata', 'urticaria']
 */

const DISEASES_DATA = {
  'MF': {
    displayName: 'Mycosis Fungoides (MF)',
    about: 'Mycosis Fungoides is the most common type of cutaneous T-cell lymphoma, a rare cancer of the immune system. It primarily affects the skin, causing patches, plaques, and tumors. It progresses slowly over years and is often mistaken for eczema or psoriasis in its early stages.',
    commonSigns: [
      'Flat, scaly patches on sun-protected areas',
      'Itchy, red or pink patches on the skin',
      'Thickened plaques that may crust',
      'Skin tumors in advanced stages',
      'Enlarged lymph nodes (in later stages)',
      'Skin lesions vary in size and shape'
    ],
    recommendations: [
      'Consult a dermatologist or oncologist immediately for proper diagnosis.',
      'A skin biopsy is essential to confirm the diagnosis.',
      'Avoid self-treatment; this condition requires professional medical management.',
      'Follow up regularly with a specialist for monitoring disease progression.'
    ],
    instructions: [
      { title: 'Sun Protection', desc: 'Protect skin from UV exposure; use SPF 50+ sunscreen daily.', icon: 'sun' },
      { title: 'Monitoring', desc: 'Track any new lesions or changes in existing patches.', icon: 'eye' },
      { title: 'Avoid Irritants', desc: 'Use gentle, fragrance-free skincare products.', icon: 'ban' },
      { title: 'Regular Follow-up', desc: 'Schedule regular dermatology appointments every 3 months.', icon: 'calendar' }
    ],
    medicines: [
      {
        name: 'Topical Corticosteroids (e.g., Betamethasone)',
        type: 'Anti-inflammatory - For early stage patches',
        when: 'Apply in the evening',
        frequency: 'Once daily for 4-6 weeks',
        usage: 'Apply thin layer to affected patches only'
      },
      {
        name: 'Topical Nitrogen Mustard (Mechlorethamine)',
        type: 'Chemotherapy Cream - First-line for MF',
        when: 'Once daily as directed by specialist',
        frequency: 'Daily application for months',
        usage: 'Apply to affected skin areas, avoid healthy skin'
      },
      {
        name: 'Phototherapy (PUVA/NB-UVB)',
        type: 'Light Therapy - Highly effective for patches',
        when: '2-3 sessions per week in clinic',
        frequency: 'As scheduled by dermatologist',
        usage: 'Performed under medical supervision only'
      }
    ]
  },

  'annular lichen': {
    displayName: 'Annular Lichen Planus',
    about: 'Annular Lichen Planus is an inflammatory skin condition that forms ring-shaped (annular) lesions. It is a variant of lichen planus and typically appears on the skin with a central clearing and active border. The exact cause is unknown but is believed to be related to an abnormal immune response.',
    commonSigns: [
      'Ring-shaped (annular) skin lesions',
      'Purple or violet flat-topped bumps',
      'Central clearing with active raised border',
      'Mild to moderate itching',
      'Lesions commonly on genitals, axillae, and extremities',
      'Wickham striae (fine white lines on lesions)'
    ],
    recommendations: [
      'Visit a dermatologist for clinical diagnosis and possible biopsy.',
      'Avoid scratching to prevent secondary infections.',
      'Identify and eliminate potential triggers such as medications.',
      'Use moisturizers regularly to reduce dryness and itching.'
    ],
    instructions: [
      { title: 'Sun Protection', desc: 'UV exposure can worsen lesions; use broad-spectrum sunscreen.', icon: 'sun' },
      { title: 'Monitoring', desc: 'Monitor the spread and size of ring-shaped lesions.', icon: 'eye' },
      { title: 'Avoid Triggers', desc: 'Avoid NSAIDs and certain blood pressure medications if identified as triggers.', icon: 'ban' },
      { title: 'Follow-up', desc: 'Regular check-ups to assess treatment response.', icon: 'calendar' }
    ],
    medicines: [
      {
        name: 'Clobetasol Propionate 0.05% Cream',
        type: 'Potent Topical Corticosteroid - First-line treatment',
        when: 'Apply twice daily',
        frequency: 'Twice daily for 2-4 weeks',
        usage: 'Apply directly to active ring border, not center'
      },
      {
        name: 'Tacrolimus 0.1% Ointment',
        type: 'Calcineurin Inhibitor - Steroid-sparing option',
        when: 'Morning and evening',
        frequency: 'Twice daily for 3-6 months',
        usage: 'Ideal for sensitive areas and face'
      },
      {
        name: 'Hydroxychloroquine 200mg',
        type: 'Antimalarial - For widespread or resistant cases',
        when: 'Take after meals',
        frequency: 'Once or twice daily as prescribed',
        usage: 'Requires regular eye monitoring'
      }
    ]
  },

  'healty': {
    displayName: 'Healthy Skin',
    about: 'The analysis indicates that your skin appears healthy with no significant signs of disease detected. Healthy skin has an even tone, smooth texture, and no unusual lesions or abnormalities. Maintaining good skin health involves proper hydration, sun protection, and a balanced diet.',
    commonSigns: [
      'Even skin tone and texture',
      'No unusual patches or lesions',
      'Well-hydrated and elastic skin',
      'No excessive redness or irritation',
      'Normal skin barrier function',
      'No signs of active inflammation'
    ],
    recommendations: [
      'Continue your current skincare routine for maintenance.',
      'Apply broad-spectrum SPF 30+ sunscreen daily.',
      'Stay hydrated and maintain a balanced diet rich in antioxidants.',
      'Perform regular self-skin checks and consult a dermatologist annually.'
    ],
    instructions: [
      { title: 'Sun Protection', desc: 'Apply SPF 30+ sunscreen every morning, reapply every 2 hours outdoors.', icon: 'sun' },
      { title: 'Skin Monitoring', desc: 'Check your skin monthly for any new moles or changes.', icon: 'eye' },
      { title: 'Avoid Harsh Products', desc: 'Use gentle, pH-balanced cleansers and moisturizers.', icon: 'ban' },
      { title: 'Annual Check-up', desc: 'Visit a dermatologist once a year for a professional skin exam.', icon: 'calendar' }
    ],
    medicines: [
      {
        name: 'Broad-Spectrum Sunscreen SPF 50+',
        type: 'Preventive Care - Daily use',
        when: 'Every morning before going out',
        frequency: 'Daily, reapply every 2 hours',
        usage: 'Apply generously to all exposed skin areas'
      },
      {
        name: 'Gentle Moisturizer (Ceramide-based)',
        type: 'Skin Barrier Support - Maintenance',
        when: 'After shower, morning and evening',
        frequency: 'Twice daily',
        usage: 'Apply to slightly damp skin for best absorption'
      },
      {
        name: 'Vitamin C Serum 10-20%',
        type: 'Antioxidant - Skin brightening and protection',
        when: 'Apply in the morning before sunscreen',
        frequency: 'Once daily',
        usage: 'Apply 3-5 drops to clean, dry face'
      }
    ]
  },

  'psoriasis': {
    displayName: 'Psoriasis',
    about: 'Psoriasis is a chronic autoimmune skin condition that causes rapid skin cell turnover, resulting in scaly, thick, red patches covered with silvery scales. It is not contagious and tends to cycle through flares and remissions. It can affect any part of the body and may be associated with psoriatic arthritis.',
    commonSigns: [
      'Red patches covered with thick, silvery-white scales',
      'Dry, cracked skin that may bleed',
      'Itching, burning, or soreness',
      'Thickened, pitted, or ridged nails',
      'Swollen and stiff joints (psoriatic arthritis)',
      'Plaques commonly on elbows, knees, and scalp'
    ],
    recommendations: [
      'Consult a dermatologist for an accurate diagnosis and treatment plan.',
      'Avoid triggers such as stress, smoking, and alcohol.',
      'Keep skin moisturized to reduce scaling and cracking.',
      'Phototherapy may be recommended for moderate to severe cases.'
    ],
    instructions: [
      { title: 'Sun Protection', desc: 'Moderate sun exposure can help, but avoid sunburn which triggers flares.', icon: 'sun' },
      { title: 'Monitoring', desc: 'Track flare-ups and identify personal triggers to manage them.', icon: 'eye' },
      { title: 'Avoid Triggers', desc: 'Stress, alcohol, and certain medications can worsen psoriasis.', icon: 'ban' },
      { title: 'Regular Follow-up', desc: 'Check in with your dermatologist every 3-6 months.', icon: 'calendar' }
    ],
    medicines: [
      {
        name: 'Calcipotriol 0.005% Cream (Vitamin D analog)',
        type: 'First-line Topical - Reduces cell turnover',
        when: 'Apply in the morning',
        frequency: 'Once or twice daily for 8 weeks',
        usage: 'Apply to plaques only, avoid face and skin folds'
      },
      {
        name: 'Betamethasone Dipropionate 0.05% Cream',
        type: 'Topical Corticosteroid - Anti-inflammatory',
        when: 'Apply in the evening',
        frequency: 'Once daily, max 4 weeks continuously',
        usage: 'Use on thick plaques; taper gradually'
      },
      {
        name: 'Coal Tar Shampoo/Cream 2-5%',
        type: 'Keratolytic - Reduces scaling',
        when: 'During shower or bath',
        frequency: '2-3 times per week',
        usage: 'Leave on for 5-10 minutes before rinsing'
      },
      {
        name: 'Methotrexate 7.5-25mg (if severe)',
        type: 'Systemic Immunosuppressant - For severe cases',
        when: 'Once weekly as prescribed',
        frequency: 'Weekly oral dose',
        usage: 'Use only under medical supervision; requires regular blood tests for liver monitoring'
      }
    ]
  },

  'tinea circinata': {
    displayName: 'Tinea Circinata (Ringworm)',
    about: 'Tinea Circinata, commonly known as ringworm or tinea corporis, is a fungal infection of the skin. Despite its name, it has nothing to do with worms. It causes ring-shaped, scaly patches on the skin and is highly contagious. It is caused by dermatophyte fungi and spreads through direct contact.',
    commonSigns: [
      'Ring-shaped, red, scaly patches',
      'Itchy skin with raised borders',
      'Central clearing as the ring expands',
      'Multiple rings may overlap',
      'Redness and scaling along the border',
      'Can spread to other body parts or people'
    ],
    recommendations: [
      'Apply antifungal cream consistently for the full recommended duration.',
      'Keep the affected area clean and dry at all times.',
      'Avoid sharing personal items such as towels and clothing.',
      'Wash hands thoroughly after touching the affected area.'
    ],
    instructions: [
      { title: 'Keep Dry', desc: 'Moisture promotes fungal growth; keep skin dry especially after bathing.', icon: 'sun' },
      { title: 'Monitor Spread', desc: 'Watch for new rings appearing on other body parts.', icon: 'eye' },
      { title: 'Avoid Contact', desc: 'Avoid skin-to-skin contact with others until fully healed.', icon: 'ban' },
      { title: 'Complete Treatment', desc: 'Continue antifungal treatment for 2 weeks after symptoms clear.', icon: 'calendar' }
    ],
    medicines: [
      {
        name: 'Clotrimazole 1% Cream',
        type: 'Antifungal - First-line OTC treatment',
        when: 'Apply morning and evening',
        frequency: 'Twice daily for 4 weeks',
        usage: 'Apply 2cm beyond the ring border; rub gently'
      },
      {
        name: 'Terbinafine 1% Cream',
        type: 'Allylamine Antifungal - Fast-acting',
        when: 'Once or twice daily',
        frequency: 'Once daily for 1-2 weeks',
        usage: 'Apply to affected area and surrounding skin'
      },
      {
        name: 'Fluconazole 150mg (if extensive)',
        type: 'Oral Antifungal - For widespread infection',
        when: 'Once weekly as prescribed',
        frequency: '2-4 weeks depending on severity',
        usage: 'Take with or without food; avoid alcohol'
      }
    ]
  },

  'urticaria': {
    displayName: 'Urticaria (Hives)',
    about: 'Urticaria, commonly known as hives, is a skin reaction causing raised, itchy welts (wheals) that appear suddenly on the skin. They can be triggered by allergies, infections, stress, or medications. Acute urticaria resolves within 6 weeks, while chronic urticaria can last longer and may require ongoing treatment.',
    commonSigns: [
      'Raised, red or skin-colored welts (wheals)',
      'Intense itching or burning sensation',
      'Welts that change size and shape rapidly',
      'Swelling of lips, eyes, or throat (angioedema)',
      'Skin that blanches (turns white) when pressed',
      'Symptoms that come and go within 24 hours'
    ],
    recommendations: [
      'Identify and avoid known triggers (foods, medications, stress).',
      'Take antihistamines as directed to control symptoms.',
      'Seek emergency care if swelling affects breathing or throat.',
      'Keep a symptom diary to help identify your personal triggers.'
    ],
    instructions: [
      { title: 'Avoid Heat', desc: 'Heat and sweating can trigger or worsen hives; stay cool.', icon: 'sun' },
      { title: 'Monitor Symptoms', desc: 'Track when hives appear and potential triggers.', icon: 'eye' },
      { title: 'Avoid Triggers', desc: 'Common triggers: shellfish, nuts, NSAIDs, latex, and stress.', icon: 'ban' },
      { title: 'Follow-up', desc: 'If hives persist beyond 6 weeks, consult an allergist.', icon: 'calendar' }
    ],
    medicines: [
      {
        name: 'Cetirizine 10mg (Zyrtec)',
        type: 'Non-sedating Antihistamine - First-line treatment',
        when: 'Once daily, preferably at night',
        frequency: 'Daily until symptoms resolve',
        usage: 'Take with water; avoid alcohol'
      },
      {
        name: 'Loratadine 10mg (Claritin)',
        type: 'Non-sedating Antihistamine - Daytime use',
        when: 'Once in the morning',
        frequency: 'Daily as needed',
        usage: 'Can be taken with or without food'
      },
      {
        name: 'Fexofenadine 180mg (Allegra)',
        type: 'Non-sedating Antihistamine - Long-acting',
        when: 'Once daily',
        frequency: 'Daily for chronic urticaria',
        usage: 'Do not take with fruit juices (reduces absorption)'
      },
      {
        name: 'Prednisolone 20-40mg (if severe)',
        type: 'Oral Corticosteroid - For acute severe attacks',
        when: 'In the morning with food',
        frequency: '5-7 days short course only',
        usage: 'Use only under medical supervision; do not stop abruptly; taper as directed'
      }
    ]
  }
};

const AR_DISEASES_DATA = {
  'MF': {
    displayName: 'الفطار الفطراني (MF)',
    about: 'الفطار الفطراني نوع نادر من اللمفوما الجلدية قد يظهر على شكل بقع أو لويحات جلدية مستمرة. قد يشبه الإكزيما أو الصدفية في بداياته، لذلك يحتاج إلى تقييم طبي متخصص ولا يعتمد تشخيصه على الصورة فقط.',
    commonSigns: [
      'بقع جلدية طويلة المدة',
      'حكة أو تهيج مستمر',
      'قشور أو تغيرات في لون الجلد',
      'لويحات جلدية قد تصبح أكثر سماكة',
      'تغيرات لا تتحسن بالعلاج المعتاد',
      'انتشار تدريجي أو تكرار في نفس المناطق'
    ],
    recommendations: [
      'راجع طبيب جلدية أو متخصصاً في أسرع وقت للتقييم.',
      'قد يحتاج الطبيب إلى فحص سريري أو عينة جلدية لتأكيد التشخيص.',
      'تجنب التشخيص الذاتي أو استخدام علاجات قوية دون وصفة.',
      'تابع أي تغيرات في حجم أو لون أو انتشار البقع.'
    ],
    instructions: [
      { title: 'الحماية من الشمس', desc: 'احمِ الجلد من التعرض الزائد للشمس واستخدم واقياً مناسباً عند الحاجة.', icon: 'sun' },
      { title: 'المتابعة', desc: 'راقب أي بقع جديدة أو تغيرات في المناطق الموجودة.', icon: 'eye' },
      { title: 'تجنب المهيجات', desc: 'استخدم منتجات لطيفة وخالية من العطور قدر الإمكان.', icon: 'ban' },
      { title: 'مراجعة منتظمة', desc: 'اتبع خطة المتابعة التي يحددها الطبيب المختص.', icon: 'calendar' }
    ],
  },

  'annular lichen': {
    displayName: 'الحزاز الحلقي',
    about: 'الحزاز الحلقي حالة جلدية التهابية قد تظهر على شكل بقع دائرية أو حلقية. قد تتشابه مع العدوى الفطرية في الشكل، لذلك يساعد فحص طبيب الجلدية في التفريق بينها واختيار العلاج المناسب.',
    commonSigns: [
      'بقع دائرية أو حلقية الشكل',
      'حكة خفيفة إلى متوسطة',
      'تغير في لون الجلد',
      'حواف مرتفعة أو أوضح من المركز',
      'جفاف أو قشور بسيطة',
      'ظهور أكثر من بقعة في بعض الحالات'
    ],
    recommendations: [
      'حافظ على نظافة المنطقة وجفافها.',
      'تجنب الحك الشديد لتقليل التهيج.',
      'لا تستخدم كريمات عشوائية قبل التأكد من التشخيص.',
      'راجع طبيب الجلدية إذا انتشر الطفح أو لم يتحسن.'
    ],
    instructions: [
      { title: 'العناية بالجلد', desc: 'استخدم مرطباً لطيفاً إذا كان الجلد جافاً أو متهيجاً.', icon: 'sun' },
      { title: 'المراقبة', desc: 'راقب حجم وشكل البقع وهل تظهر بقع جديدة.', icon: 'eye' },
      { title: 'تجنب الحك', desc: 'الحك قد يزيد الالتهاب أو يسبب خدوشاً وعدوى ثانوية.', icon: 'ban' },
      { title: 'المتابعة الطبية', desc: 'استشر الطبيب إذا استمرت الحالة أو تكررت.', icon: 'calendar' }
    ],
  },

  'healty': {
    displayName: 'بشرة سليمة',
    about: 'تشير النتيجة إلى أن الصورة لا تظهر علامات واضحة لإحدى الحالات الجلدية المدعومة من النموذج. هذا لا يعني فحصاً طبياً نهائياً، لذلك يظل من المهم مراقبة أي تغيرات جلدية مقلقة.',
    commonSigns: [
      'لون جلد متوازن نسبياً',
      'عدم وجود طفح واضح في الصورة',
      'عدم وجود نمط مرضي واضح للنموذج',
      'ملمس أو مظهر قريب من الطبيعي',
      'عدم وجود احمرار شديد ظاهر',
      'عدم وجود قشور أو التهاب واضح'
    ],
    recommendations: [
      'استمر في العناية الطبيعية بالبشرة.',
      'استخدم واقي شمس مناسباً عند التعرض للشمس.',
      'راقب أي بقعة جديدة أو تغير في اللون أو الحجم.',
      'راجع طبيب الجلدية إذا ظهر ألم أو نزيف أو تغير مقلق.'
    ],
    instructions: [
      { title: 'الحماية من الشمس', desc: 'استخدم واقي شمس مناسباً عند الخروج نهاراً.', icon: 'sun' },
      { title: 'المتابعة الذاتية', desc: 'افحص الجلد دورياً ولاحظ أي تغيرات جديدة.', icon: 'eye' },
      { title: 'تجنب المنتجات القاسية', desc: 'اختر غسولاً ومرطباً لطيفين على البشرة.', icon: 'ban' },
      { title: 'فحص دوري', desc: 'استشر طبيب الجلدية عند ظهور أي علامة غير معتادة.', icon: 'calendar' }
    ],
  },

  'psoriasis': {
    displayName: 'الصدفية',
    about: 'الصدفية حالة جلدية التهابية مزمنة قد تسبب بقعاً حمراء أو سميكة مغطاة بقشور. قد تظهر على شكل نوبات تتحسن ثم تعود، وقد تحتاج إلى متابعة مع طبيب الجلدية لتحديد العلاج المناسب.',
    commonSigns: [
      'بقع حمراء أو متهيجة',
      'قشور بيضاء أو فضية',
      'جفاف أو تشقق في الجلد',
      'حكة أو شعور بالحرقان',
      'تكرار النوبات في نفس المناطق',
      'قد يصاحبها ألم أو تيبس في المفاصل'
    ],
    recommendations: [
      'رطب الجلد بانتظام لتقليل الجفاف والقشور.',
      'تجنب الحك والمهيجات المعروفة.',
      'راجع طبيب الجلدية لتأكيد التشخيص وخطة العلاج.',
      'اطلب تقييماً طبياً إذا كانت الأعراض واسعة أو مؤلمة أو متكررة.'
    ],
    instructions: [
      { title: 'ترطيب الجلد', desc: 'استخدم مرطباً مناسباً بانتظام لتقليل الجفاف.', icon: 'sun' },
      { title: 'متابعة النوبات', desc: 'لاحظ العوامل التي تزيد الأعراض مثل التوتر أو بعض الأدوية.', icon: 'eye' },
      { title: 'تجنب الحك', desc: 'الحك قد يزيد الالتهاب أو يسبب تشققات.', icon: 'ban' },
      { title: 'متابعة طبية', desc: 'اتبع إرشادات طبيب الجلدية خاصة عند تكرار النوبات.', icon: 'calendar' }
    ],
  },

  'tinea circinata': {
    displayName: 'التينيا الحلقية',
    about: 'التينيا الحلقية عدوى فطرية شائعة تظهر غالباً على شكل طفح جلدي دائري أو حلقي. قد تسبب الحكة والقشور وقد تنتشر بالتلامس المباشر أو مشاركة المناشف والملابس.',
    commonSigns: [
      'طفح جلدي دائري أو حلقي',
      'حكة أو تهيج',
      'قشور على حواف المنطقة',
      'احمرار أو تفتيح في منتصف البقعة',
      'حواف مرتفعة نسبياً',
      'انتشار تدريجي إذا لم تعالج بشكل مناسب'
    ],
    recommendations: [
      'حافظ على جفاف ونظافة المنطقة.',
      'تجنب مشاركة المناشف أو الملابس.',
      'لا تستخدم كريمات عشوائية بدون استشارة.',
      'راجع طبيب الجلدية للحصول على العلاج المناسب.'
    ],
    instructions: [
      { title: 'حافظ على الجفاف', desc: 'الرطوبة تساعد الفطريات على النمو، لذلك جفف الجلد جيداً.', icon: 'sun' },
      { title: 'راقب الانتشار', desc: 'لاحظ ظهور حلقات جديدة أو زيادة حجم الطفح.', icon: 'eye' },
      { title: 'تجنب العدوى', desc: 'لا تشارك المناشف أو الملابس واغسل يديك بعد لمس المنطقة.', icon: 'ban' },
      { title: 'أكمل العلاج', desc: 'إذا وصف الطبيب علاجاً، أكمله حسب التعليمات حتى لو تحسنت الأعراض.', icon: 'calendar' }
    ],
  },

  'urticaria': {
    displayName: 'الشرى / الأرتيكاريا',
    about: 'الشرى أو الأرتيكاريا تفاعل جلدي يسبب انتفاخات أو بقعاً مرتفعة ومثيرة للحكة. قد تظهر وتختفي بسرعة، وقد ترتبط بحساسية أو أطعمة أو أدوية أو عدوى أو توتر.',
    commonSigns: [
      'بقع مرتفعة مثيرة للحكة',
      'احمرار أو تورم في الجلد',
      'ظهور واختفاء سريع للبقع',
      'تغير شكل أو مكان البقع خلال اليوم',
      'تورم في الشفاه أو الوجه في بعض الحالات',
      'حكة شديدة أو إحساس بالحرقان'
    ],
    recommendations: [
      'حاول تجنب المحفزات المحتملة إذا كانت معروفة.',
      'راقب توقيت ظهور الأعراض وما يرتبط بها.',
      'اطلب المساعدة فوراً إذا حدث ضيق تنفس أو تورم في الوجه أو الشفاه.',
      'راجع طبيب الجلدية أو الحساسية إذا تكررت الحالة أو استمرت.'
    ],
    instructions: [
      { title: 'تجنب الحرارة', desc: 'الحرارة والتعرق قد يزيدان الحكة لدى بعض الأشخاص.', icon: 'sun' },
      { title: 'راقب الأعراض', desc: 'دوّن الأطعمة أو الأدوية أو المواقف التي تسبق ظهور الأعراض.', icon: 'eye' },
      { title: 'تجنب المحفزات', desc: 'ابتعد عن أي محفز معروف حتى يتم تقييم الحالة.', icon: 'ban' },
      { title: 'مراجعة طبية', desc: 'استشر الطبيب إذا تكررت الأعراض أو استمرت أكثر من عدة أسابيع.', icon: 'calendar' }
    ],
  }
};

const MEDICINE_ITEM_IDS = {
  'MF': [
    'topical-corticosteroids',
    'topical-nitrogen-mustard',
    'phototherapy'
  ],
  'annular lichen': [
    'clobetasol-propionate',
    'tacrolimus-ointment',
    'hydroxychloroquine'
  ],
  'healty': [
    'broad-spectrum-sunscreen',
    'gentle-moisturizer',
    'vitamin-c-serum'
  ],
  'psoriasis': [
    'calcipotriol-cream',
    'betamethasone-cream',
    'coal-tar',
    'methotrexate'
  ],
  'tinea circinata': [
    'clotrimazole-cream',
    'terbinafine-cream',
    'fluconazole'
  ],
  'urticaria': [
    'cetirizine',
    'loratadine',
    'fexofenadine',
    'prednisolone'
  ]
};

const MEDICINE_AR_TRANSLATIONS = {
  'MF': [
    {
      name: 'كورتيكوستيرويدات موضعية (مثل بيتاميثازون)',
      type: 'مضاد التهاب - للبقع في المراحل المبكرة',
      when: 'يستخدم مساءً',
      frequency: 'مرة يومياً لمدة 4-6 أسابيع',
      usage: 'توضع طبقة رقيقة على البقع المصابة فقط'
    },
    {
      name: 'نيتروجين ماسترد موضعي (ميكلوريثامين)',
      type: 'كريم علاجي متخصص - من الخيارات المستخدمة للفطار الفطراني',
      when: 'مرة يومياً حسب توجيه الطبيب المختص',
      frequency: 'استخدام يومي لعدة أشهر حسب الخطة الطبية',
      usage: 'يوضع على المناطق المصابة فقط مع تجنب الجلد السليم'
    },
    {
      name: 'العلاج الضوئي (PUVA/NB-UVB)',
      type: 'علاج ضوئي - قد يكون فعالاً للبقع',
      when: '2-3 جلسات أسبوعياً داخل العيادة',
      frequency: 'حسب جدول طبيب الجلدية',
      usage: 'يجرى فقط تحت إشراف طبي'
    }
  ],
  'annular lichen': [
    {
      name: 'كريم كلوبيتازول بروبيونات 0.05%',
      type: 'كورتيكوستيرويد موضعي قوي - علاج أولي شائع',
      when: 'يوضع مرتين يومياً',
      frequency: 'مرتين يومياً لمدة 2-4 أسابيع',
      usage: 'يوضع مباشرة على الحافة النشطة للحلقة وليس المركز'
    },
    {
      name: 'مرهم تاكروليمس 0.1%',
      type: 'مثبط كالسينيورين - بديل يقلل استخدام الستيرويد',
      when: 'صباحاً ومساءً',
      frequency: 'مرتين يومياً لمدة 3-6 أشهر حسب التوجيه الطبي',
      usage: 'مناسب للمناطق الحساسة والوجه حسب وصف الطبيب'
    },
    {
      name: 'هيدروكسي كلوروكوين 200 مجم',
      type: 'دواء مضاد للملاريا - للحالات المنتشرة أو المقاومة',
      when: 'يؤخذ بعد الطعام',
      frequency: 'مرة أو مرتين يومياً حسب وصف الطبيب',
      usage: 'يتطلب متابعة وفحصاً دورياً للعين'
    }
  ],
  'healty': [
    {
      name: 'واقي شمس واسع الطيف SPF 50+',
      type: 'عناية وقائية - استخدام يومي',
      when: 'كل صباح قبل الخروج',
      frequency: 'يومياً، ويعاد كل ساعتين عند التعرض للشمس',
      usage: 'يوضع بكمية كافية على كل مناطق الجلد المكشوفة'
    },
    {
      name: 'مرطب لطيف (يعتمد على السيراميدات)',
      type: 'دعم حاجز الجلد - عناية مستمرة',
      when: 'بعد الاستحمام صباحاً ومساءً',
      frequency: 'مرتين يومياً',
      usage: 'يوضع على بشرة رطبة قليلاً لامتصاص أفضل'
    },
    {
      name: 'سيروم فيتامين C بتركيز 10-20%',
      type: 'مضاد أكسدة - يساعد على إشراق البشرة وحمايتها',
      when: 'يوضع صباحاً قبل واقي الشمس',
      frequency: 'مرة يومياً',
      usage: 'توضع 3-5 قطرات على بشرة نظيفة وجافة'
    }
  ],
  'psoriasis': [
    {
      name: 'كريم كالسيبوتريول 0.005% (مشابه فيتامين D)',
      type: 'علاج موضعي أولي - يقلل سرعة تكاثر خلايا الجلد',
      when: 'يوضع صباحاً',
      frequency: 'مرة أو مرتين يومياً لمدة 8 أسابيع',
      usage: 'يوضع على اللويحات فقط، مع تجنب الوجه وثنايا الجلد'
    },
    {
      name: 'كريم بيتاميثازون ديبروبيونات 0.05%',
      type: 'كورتيكوستيرويد موضعي - مضاد التهاب',
      when: 'يوضع مساءً',
      frequency: 'مرة يومياً، لمدة لا تتجاوز 4 أسابيع متواصلة',
      usage: 'يستخدم على اللويحات السميكة؛ ويتم تقليله تدريجياً حسب التوجيه'
    },
    {
      name: 'شامبو/كريم قطران الفحم 2-5%',
      type: 'مقشر ومخفف للقشور',
      when: 'أثناء الاستحمام',
      frequency: '2-3 مرات أسبوعياً',
      usage: 'يترك 5-10 دقائق قبل الشطف'
    },
    {
      name: 'ميثوتريكسات 7.5-25 مجم (إذا كانت الحالة شديدة)',
      type: 'مثبط مناعي جهازي - للحالات الشديدة فقط',
      when: 'مرة أسبوعياً حسب وصف الطبيب',
      frequency: 'جرعة فموية أسبوعية',
      usage: 'يستخدم فقط تحت إشراف طبي ويتطلب فحوصات دم منتظمة لمتابعة الكبد'
    }
  ],
  'tinea circinata': [
    {
      name: 'كريم كلوتريمازول 1%',
      type: 'مضاد فطريات - علاج موضعي أولي متاح بدون وصفة في بعض الحالات',
      when: 'يوضع صباحاً ومساءً',
      frequency: 'مرتين يومياً لمدة 4 أسابيع',
      usage: 'يوضع على حدود الحلقة وما حولها بحوالي 2 سم مع التدليك بلطف'
    },
    {
      name: 'كريم تيربينافين 1%',
      type: 'مضاد فطريات من مجموعة الأليلامين - سريع المفعول',
      when: 'مرة أو مرتين يومياً',
      frequency: 'مرة يومياً لمدة 1-2 أسبوع',
      usage: 'يوضع على المنطقة المصابة والجلد المحيط بها'
    },
    {
      name: 'فلوكونازول 150 مجم (إذا كانت العدوى واسعة)',
      type: 'مضاد فطريات فموي - للعدوى المنتشرة',
      when: 'مرة أسبوعياً حسب وصف الطبيب',
      frequency: 'لمدة 2-4 أسابيع حسب شدة الحالة',
      usage: 'يؤخذ مع أو بدون طعام؛ ويفضل تجنب الكحول'
    }
  ],
  'urticaria': [
    {
      name: 'سيتريزين 10 مجم (زيرتك)',
      type: 'مضاد هيستامين غير مسبب للنعاس - علاج أولي شائع',
      when: 'مرة يومياً، ويفضل ليلاً',
      frequency: 'يومياً حتى تحسن الأعراض',
      usage: 'يؤخذ مع الماء؛ ويفضل تجنب الكحول'
    },
    {
      name: 'لوراتادين 10 مجم (كلاريتين)',
      type: 'مضاد هيستامين غير مسبب للنعاس - مناسب للاستخدام نهاراً',
      when: 'مرة صباحاً',
      frequency: 'يومياً عند الحاجة',
      usage: 'يمكن تناوله مع الطعام أو بدونه'
    },
    {
      name: 'فيكسوفينادين 180 مجم (أليجرا)',
      type: 'مضاد هيستامين غير مسبب للنعاس - طويل المفعول',
      when: 'مرة يومياً',
      frequency: 'يومياً في حالات الشرى المزمن حسب التوجيه الطبي',
      usage: 'لا يؤخذ مع عصائر الفاكهة لأنها قد تقلل الامتصاص'
    },
    {
      name: 'بريدنيزولون 20-40 مجم (إذا كانت الحالة شديدة)',
      type: 'كورتيكوستيرويد فموي - للنوبات الحادة الشديدة',
      when: 'صباحاً مع الطعام',
      frequency: 'دورة قصيرة 5-7 أيام فقط',
      usage: 'يستخدم فقط تحت إشراف طبي؛ لا توقفه فجأة واتبع خطة تقليل الجرعة'
    }
  ]
};

const getLocalizedMedicines = (key, language = 'en') => {
  const medicines = DISEASES_DATA[key]?.medicines || [];
  const ids = MEDICINE_ITEM_IDS[key] || [];
  const translations = language === 'ar' ? MEDICINE_AR_TRANSLATIONS[key] || [] : [];

  return medicines.map((medicine, index) => ({
    id: ids[index] || `${key}-${index + 1}`,
    ...medicine,
    ...(translations[index] || {})
  }));
};

const getFallbackMedicines = (language = 'en') => {
  if (language === 'ar') {
    return [
      {
        id: 'dermatologist-guidance',
        name: 'حسب وصف طبيب الجلدية',
        type: 'استشر مختصاً قبل استخدام أي دواء',
        when: 'حسب التوجيه الطبي',
        frequency: 'حسب التوجيه الطبي',
        usage: 'لا تستخدم علاجاً ذاتياً'
      }
    ];
  }

  return [
    {
      id: 'dermatologist-guidance',
      name: 'As prescribed by your dermatologist',
      type: 'Consult a specialist before using any medication',
      when: 'As directed',
      frequency: 'As directed',
      usage: 'Do not self-medicate'
    }
  ];
};

const normalizeDiseaseKey = (diseaseType) => {
  const value = String(diseaseType || '').trim().toLowerCase();

  if (!value) return 'healty';
  if (['mf', 'mycosis fungoides', 'mycosis fungoides (mf)', 'mf / mycosis fungoides', 'mycosis fungoides / mf'].includes(value)) return 'MF';
  if (['annular lichen', 'annular lichen planus'].includes(value)) return 'annular lichen';
  if (['healthy', 'healty', 'healthy skin', 'healthy / healty', 'healty / healthy', 'بشرة سليمة'].includes(value)) return 'healty';
  if (value === 'psoriasis') return 'psoriasis';
  if (['tinea circinata', 'tinea circinata (ringworm)', 'tinea circinata / ringworm', 'ringworm', 'tinea corporis'].includes(value)) return 'tinea circinata';
  if (['urticaria', 'urticaria (hives)', 'hives'].includes(value)) return 'urticaria';

  const key = Object.keys(DISEASES_DATA).find(
    k => k.toLowerCase() === value
  );

  return key || null;
};

/**
 * Get disease data by disease type from Backend
 */
export const getDiseaseData = (diseaseType, language = 'en') => {
  const key = normalizeDiseaseKey(diseaseType);
  const baseData = key ? DISEASES_DATA[key] : null;

  if (language === 'ar') {
    if (key && AR_DISEASES_DATA[key]) {
      return {
        ...baseData,
        ...AR_DISEASES_DATA[key],
        medicines: getLocalizedMedicines(key, language),
      };
    }

    return {
      displayName: diseaseType || 'حالة جلدية',
      about: 'هذه حالة جلدية تحتاج إلى تقييم طبي متخصص. لا تعتمد على نتيجة الصورة وحدها للحصول على تشخيص نهائي.',
      commonSigns: ['تغيرات جلدية تحتاج إلى فحص طبي', 'راجع طبيب الجلدية للتقييم الكامل'],
      recommendations: ['استشر طبيب جلدية للحصول على تشخيص وخطة علاج مناسبة.'],
      instructions: [
        { title: 'الحماية من الشمس', desc: 'احمِ الجلد المصاب من التعرض الزائد للشمس.', icon: 'sun' },
        { title: 'المتابعة', desc: 'راقب أي تغيرات في الحالة الجلدية.', icon: 'eye' },
        { title: 'تجنب المهيجات', desc: 'استخدم منتجات لطيفة فقط على الجلد.', icon: 'ban' },
        { title: 'مراجعة الطبيب', desc: 'ينصح بمتابعة الحالة مع طبيب جلدية.', icon: 'calendar' }
      ],
      medicines: getFallbackMedicines(language)
    };
  }

  if (baseData) {
    return {
      ...baseData,
      medicines: getLocalizedMedicines(key, language),
    };
  }

  return {
    displayName: diseaseType,
    about: `${diseaseType} is a skin condition that requires professional medical evaluation. Please consult a dermatologist for accurate diagnosis and treatment.`,
    commonSigns: ['Skin changes requiring medical evaluation', 'Consult a dermatologist for full assessment'],
    recommendations: ['Consult a dermatologist for proper diagnosis and treatment plan.'],
    instructions: [
      { title: 'Sun Protection', desc: 'Protect affected skin from sun exposure.', icon: 'sun' },
      { title: 'Monitoring', desc: 'Monitor any changes in skin condition.', icon: 'eye' },
      { title: 'Avoid Irritants', desc: 'Use gentle skincare products only.', icon: 'ban' },
      { title: 'Follow-up', desc: 'Regular dermatology appointments recommended.', icon: 'calendar' }
    ],
    medicines: getFallbackMedicines(language)
  };
};

export const getDiseaseDisplayName = (diseaseType, language = 'en') =>
  getDiseaseData(diseaseType, language).displayName;

export default DISEASES_DATA;

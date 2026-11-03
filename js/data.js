// Static content: home workouts and affordable Algerian meal plans (Arabic + French).
// sets: one entry per training phase → [sets, reps-or-seconds]. type 'time' = seconds.

export const EXERCISES = {
  squat: {
    icon: '🦵',
    name: { ar: 'القرفصاء (سكوات) بوزن الجسم', fr: 'Squat au poids du corps' },
    muscles: { ar: 'الفخذان والأرداف', fr: 'Cuisses et fessiers' },
    type: 'reps',
    sets: [[2, '10'], [3, '12'], [3, '15']],
    rest: 60,
    steps: {
      ar: ['قف والقدمان بعرض الكتفين، أصابع القدم للخارج قليلاً.', 'ادفع الوركين للخلف وانزل كأنك تجلس على كرسي.', 'حافظ على ظهر مستقيم وصدر مرفوع وركبتين باتجاه أصابع القدم.', 'انزل حتى يوازي الفخذ الأرض تقريباً ثم ادفع بالكعبين للصعود.'],
      fr: ['Pieds largeur d’épaules, pointes légèrement ouvertes.', 'Poussez les hanches en arrière comme pour vous asseoir.', 'Dos droit, poitrine haute, genoux dans l’axe des pieds.', 'Descendez jusqu’à cuisses ~parallèles au sol puis poussez sur les talons.'],
    },
    easier: { ar: 'اجلس على كرسي وقم منه (Box squat).', fr: 'Asseyez-vous sur une chaise puis relevez-vous (box squat).' },
  },
  inclinePushup: {
    icon: '💪',
    name: { ar: 'ضغط مائل (اليدان على طاولة أو حائط)', fr: 'Pompes inclinées (mains sur table/mur)' },
    muscles: { ar: 'الصدر والكتفان والترايسبس', fr: 'Pectoraux, épaules, triceps' },
    type: 'reps',
    sets: [[2, '8'], [3, '10'], [3, '12']],
    rest: 60,
    steps: {
      ar: ['ضع يديك على حافة طاولة ثابتة أو سرير بعرض أكبر قليلاً من الكتفين.', 'اجعل جسمك خطاً مستقيماً من الرأس إلى الكعبين وشد البطن.', 'انزل بالصدر نحو الحافة والمرفقان بزاوية 45° تقريباً.', 'ادفع للأعلى حتى تستقيم الذراعان.'],
      fr: ['Mains sur le bord d’une table stable, un peu plus larges que les épaules.', 'Corps gainé en ligne droite de la tête aux talons.', 'Descendez la poitrine vers le bord, coudes à ~45°.', 'Poussez jusqu’à bras tendus.'],
    },
    easier: { ar: 'استعمل الحائط بدل الطاولة.', fr: 'Utilisez un mur à la place de la table.' },
  },
  kneePushup: {
    icon: '💪',
    name: { ar: 'ضغط على الركبتين', fr: 'Pompes sur les genoux' },
    muscles: { ar: 'الصدر والكتفان والترايسبس', fr: 'Pectoraux, épaules, triceps' },
    type: 'reps',
    sets: [[2, '6'], [3, '8'], [3, '10']],
    rest: 60,
    steps: {
      ar: ['ضع الركبتين على الأرض (فوق منشفة) واليدين تحت الكتفين.', 'اجعل الجسم مستقيماً من الركبتين إلى الرأس.', 'انزل ببطء حتى يقترب الصدر من الأرض.', 'ادفع للأعلى. عندما تصبح سهلة جرّب الضغط العادي.'],
      fr: ['Genoux au sol (sur une serviette), mains sous les épaules.', 'Corps droit des genoux à la tête.', 'Descendez lentement poitrine vers le sol.', 'Remontez. Quand c’est facile, passez aux pompes classiques.'],
    },
    easier: { ar: 'عد إلى الضغط المائل على طاولة.', fr: 'Revenez aux pompes inclinées sur table.' },
  },
  gluteBridge: {
    icon: '🍑',
    name: { ar: 'جسر الأرداف', fr: 'Pont fessier' },
    muscles: { ar: 'الأرداف وأوتار الركبة وأسفل الظهر', fr: 'Fessiers, ischios, bas du dos' },
    type: 'reps',
    sets: [[2, '12'], [3, '15'], [3, '20']],
    rest: 45,
    steps: {
      ar: ['استلقِ على ظهرك، الركبتان مثنيتان والقدمان على الأرض.', 'شد البطن واضغط بالكعبين لرفع الوركين.', 'اعصر الأرداف في الأعلى لثانيتين.', 'انزل ببطء دون أن تلمس الأرض بالكامل.'],
      fr: ['Sur le dos, genoux fléchis, pieds au sol.', 'Gainez et poussez sur les talons pour monter les hanches.', 'Serrez les fessiers 2 secondes en haut.', 'Redescendez lentement sans relâcher complètement.'],
    },
    easier: { ar: 'قلّل مدى الحركة.', fr: 'Réduisez l’amplitude.' },
  },
  backpackRow: {
    icon: '🎒',
    name: { ar: 'تجديف بالحقيبة الظهرية', fr: 'Rowing avec sac à dos' },
    muscles: { ar: 'الظهر والبايسبس', fr: 'Dos et biceps' },
    type: 'reps',
    sets: [[2, '10'], [3, '12'], [3, '15']],
    rest: 60,
    steps: {
      ar: ['املأ حقيبة ظهر بكتب أو قارورات ماء (5–10 كغ).', 'انحنِ للأمام من الوركين مع ظهر مستقيم وركبتين مثنيتين قليلاً.', 'اسحب الحقيبة نحو أسفل البطن وقرّب لوحَي الكتف.', 'أنزلها ببطء.'],
      fr: ['Remplissez un sac à dos de livres ou bouteilles d’eau (5–10 kg).', 'Penchez-vous depuis les hanches, dos droit, genoux légèrement fléchis.', 'Tirez le sac vers le bas du ventre en serrant les omoplates.', 'Redescendez lentement.'],
    },
    easier: { ar: 'خفّف وزن الحقيبة.', fr: 'Allégez le sac.' },
  },
  plank: {
    icon: '🧱',
    name: { ar: 'البلانك (اللوح)', fr: 'Planche (gainage)' },
    muscles: { ar: 'عضلات البطن العميقة والجذع', fr: 'Abdominaux profonds, tronc' },
    type: 'time',
    sets: [[2, 20], [3, 30], [3, 45]],
    rest: 45,
    steps: {
      ar: ['ارتكز على الساعدين وأصابع القدمين، المرفقان تحت الكتفين.', 'شد البطن والأرداف واجعل الجسم خطاً مستقيماً.', 'لا ترفع الوركين ولا تتركهما يهبطان.', 'تنفّس بهدوء طوال الوقت.'],
      fr: ['Appui sur avant-bras et orteils, coudes sous les épaules.', 'Serrez abdos et fessiers, corps aligné.', 'Ni hanches trop hautes ni creusées.', 'Respirez calmement.'],
    },
    easier: { ar: 'ارتكز على الركبتين.', fr: 'En appui sur les genoux.' },
  },
  deadBug: {
    icon: '🐞',
    name: { ar: 'تمرين الحشرة الميتة (Dead bug)', fr: 'Dead bug' },
    muscles: { ar: 'أسفل البطن والجذع', fr: 'Bas des abdos, tronc' },
    type: 'reps',
    sets: [[2, '8'], [3, '10'], [3, '12']],
    rest: 45,
    steps: {
      ar: ['استلقِ على ظهرك، الذراعان للأعلى والركبتان بزاوية 90°.', 'ألصق أسفل الظهر بالأرض.', 'مدّ الذراع اليمنى والساق اليسرى ببطء دون أن يرتفع الظهر.', 'عد وبدّل الجهة. (العدد لكل جهة)'],
      fr: ['Sur le dos, bras vers le plafond, genoux à 90°.', 'Plaquez le bas du dos au sol.', 'Étendez lentement bras droit et jambe gauche sans cambrer.', 'Revenez et alternez. (répétitions par côté)'],
    },
    easier: { ar: 'حرّك الساق فقط.', fr: 'Bougez seulement la jambe.' },
  },
  reverseLunge: {
    icon: '🚶',
    name: { ar: 'الطعن الخلفي (Lunge)', fr: 'Fentes arrière' },
    muscles: { ar: 'الفخذان والأرداف والتوازن', fr: 'Cuisses, fessiers, équilibre' },
    type: 'reps',
    sets: [[2, '8'], [3, '10'], [3, '12']],
    rest: 60,
    steps: {
      ar: ['قف مستقيماً، ثم ارجع بقدم واحدة خطوة كبيرة للخلف.', 'انزل حتى تقترب الركبة الخلفية من الأرض.', 'الركبة الأمامية فوق الكاحل تقريباً.', 'ادفع بالقدم الأمامية للعودة. (العدد لكل ساق)'],
      fr: ['Debout, faites un grand pas en arrière.', 'Descendez jusqu’à ce que le genou arrière frôle le sol.', 'Genou avant au-dessus de la cheville.', 'Poussez sur la jambe avant pour revenir. (par jambe)'],
    },
    easier: { ar: 'امسك كرسياً للتوازن.', fr: 'Tenez une chaise pour l’équilibre.' },
  },
  superman: {
    icon: '🦸',
    name: { ar: 'السوبرمان', fr: 'Superman' },
    muscles: { ar: 'أسفل الظهر والأرداف', fr: 'Lombaires et fessiers' },
    type: 'reps',
    sets: [[2, '10'], [3, '12'], [3, '15']],
    rest: 45,
    steps: {
      ar: ['استلقِ على بطنك والذراعان ممدودتان للأمام.', 'ارفع الذراعين والصدر والساقين قليلاً معاً.', 'اثبت ثانيتين والنظر نحو الأرض.', 'انزل ببطء.'],
      fr: ['À plat ventre, bras tendus devant.', 'Levez légèrement bras, poitrine et jambes.', 'Tenez 2 s, regard vers le sol.', 'Redescendez lentement.'],
    },
    easier: { ar: 'ارفع الذراعين فقط ثم الساقين فقط.', fr: 'Levez seulement les bras, puis seulement les jambes.' },
  },
  reverseCrunch: {
    icon: '🔄',
    name: { ar: 'الكرنش العكسي', fr: 'Crunch inversé' },
    muscles: { ar: 'أسفل البطن', fr: 'Bas des abdominaux' },
    type: 'reps',
    sets: [[2, '8'], [3, '10'], [3, '12']],
    rest: 45,
    steps: {
      ar: ['استلقِ على ظهرك والركبتان مثنيتان فوق الوركين.', 'ضع يديك بجانبك على الأرض.', 'اسحب الركبتين نحو الصدر وارفع الوركين قليلاً باستعمال البطن.', 'انزل ببطء دون أرجحة.'],
      fr: ['Sur le dos, genoux fléchis au-dessus des hanches.', 'Mains au sol le long du corps.', 'Ramenez les genoux vers la poitrine en décollant un peu le bassin.', 'Redescendez lentement sans élan.'],
    },
    easier: { ar: 'قلّل رفع الوركين.', fr: 'Décollez moins le bassin.' },
  },
  sidePlank: {
    icon: '📐',
    name: { ar: 'البلانك الجانبي', fr: 'Gainage latéral' },
    muscles: { ar: 'الخواصر وجانبا البطن', fr: 'Obliques' },
    type: 'time',
    sets: [[2, 15], [3, 20], [3, 30]],
    rest: 30,
    steps: {
      ar: ['استلقِ على جنبك مرتكزاً على الساعد، المرفق تحت الكتف.', 'ارفع الوركين حتى يصبح الجسم مستقيماً.', 'اثبت ثم بدّل الجهة. (الوقت لكل جهة)'],
      fr: ['Sur le côté, appui sur l’avant-bras, coude sous l’épaule.', 'Montez les hanches, corps aligné.', 'Tenez puis changez de côté. (temps par côté)'],
    },
    easier: { ar: 'ارتكز على الركبة السفلية.', fr: 'Appui sur le genou du bas.' },
  },
  wallSit: {
    icon: '🧍',
    name: { ar: 'الجلوس على الحائط', fr: 'Chaise contre le mur' },
    muscles: { ar: 'الفخذان', fr: 'Quadriceps' },
    type: 'time',
    sets: [[2, 20], [3, 30], [3, 45]],
    rest: 45,
    steps: {
      ar: ['أسند ظهرك إلى الحائط.', 'انزل حتى تكون الركبتان بزاوية قريبة من 90°.', 'اثبت والركبتان فوق الكاحلين.'],
      fr: ['Dos contre le mur.', 'Descendez jusqu’à genoux ~90°.', 'Tenez, genoux au-dessus des chevilles.'],
    },
    easier: { ar: 'لا تنزل كثيراً.', fr: 'Descendez moins bas.' },
  },
  pikePushup: {
    icon: '🔺',
    name: { ar: 'ضغط الكتف (Pike push-up)', fr: 'Pompes piquées (pike)' },
    muscles: { ar: 'الكتفان والترايسبس', fr: 'Épaules, triceps' },
    type: 'reps',
    sets: [[2, '5'], [3, '6'], [3, '8']],
    rest: 60,
    steps: {
      ar: ['ابدأ في وضعية الضغط ثم ارفع الوركين لتشكّل حرف V مقلوب.', 'اثنِ المرفقين وأنزل الرأس نحو الأرض بين اليدين.', 'ادفع للأعلى.'],
      fr: ['Position de pompe, puis montez les hanches en V inversé.', 'Fléchissez les coudes, tête vers le sol entre les mains.', 'Repoussez.'],
    },
    easier: { ar: 'ضع اليدين على كرسي ثابت.', fr: 'Mains sur une chaise stable.' },
  },
  goodMorning: {
    icon: '🙇',
    name: { ar: 'الانحناء بالحقيبة (Hip hinge)', fr: 'Good morning avec sac' },
    muscles: { ar: 'أوتار الركبة والأرداف وأسفل الظهر', fr: 'Ischios, fessiers, lombaires' },
    type: 'reps',
    sets: [[2, '10'], [3, '12'], [3, '15']],
    rest: 45,
    steps: {
      ar: ['احمل الحقيبة على صدرك، القدمان بعرض الوركين.', 'ادفع الوركين للخلف مع ظهر مستقيم وركبتين مرنتين.', 'انحنِ حتى تشعر بتمدد خلف الفخذ ثم عد بعصر الأرداف.'],
      fr: ['Sac contre la poitrine, pieds largeur de hanches.', 'Poussez les hanches en arrière, dos droit, genoux souples.', 'Penchez jusqu’à l’étirement des ischios puis remontez en serrant les fessiers.'],
    },
    easier: { ar: 'بدون حقيبة.', fr: 'Sans sac.' },
  },
  birdDog: {
    icon: '🐕',
    name: { ar: 'تمرين الطائر والكلب (Bird dog)', fr: 'Bird dog' },
    muscles: { ar: 'الجذع وأسفل الظهر', fr: 'Tronc et lombaires' },
    type: 'reps',
    sets: [[2, '8'], [3, '10'], [3, '12']],
    rest: 30,
    steps: {
      ar: ['قف على اليدين والركبتين.', 'مدّ الذراع اليمنى والساق اليسرى للأمام والخلف.', 'اثبت ثانيتين دون تحريك الحوض ثم بدّل. (لكل جهة)'],
      fr: ['À quatre pattes.', 'Tendez bras droit devant et jambe gauche derrière.', 'Tenez 2 s sans bouger le bassin puis alternez. (par côté)'],
    },
    easier: { ar: 'حرّك الساق فقط.', fr: 'Seulement la jambe.' },
  },
  mountainClimber: {
    icon: '⛰️',
    name: { ar: 'متسلق الجبل (ببطء)', fr: 'Mountain climbers (lents)' },
    muscles: { ar: 'البطن والقلب', fr: 'Abdos et cardio' },
    type: 'time',
    sets: [[2, 20], [3, 30], [3, 40]],
    rest: 45,
    steps: {
      ar: ['ابدأ في وضعية الضغط واليدان تحت الكتفين.', 'اسحب ركبة نحو الصدر ثم بدّل بالتناوب.', 'حافظ على ثبات الوركين، السرعة تأتي لاحقاً.'],
      fr: ['Position de pompe, mains sous les épaules.', 'Ramenez un genou vers la poitrine puis alternez.', 'Hanches stables ; la vitesse viendra plus tard.'],
    },
    easier: { ar: 'اليدان على طاولة.', fr: 'Mains sur une table.' },
  },
};

export const WARMUP = {
  ar: ['المشي في المكان — دقيقة', 'تدوير الذراعين والكتفين — 30 ثانية', 'تدوير الوركين — 30 ثانية', 'سكوات خفيف — 10 مرات', 'لمس الركبة بالكوع بالتناوب — 30 ثانية'],
  fr: ['Marche sur place — 1 min', 'Rotations bras/épaules — 30 s', 'Rotations des hanches — 30 s', 'Squats légers — 10', 'Coude-genou alterné — 30 s'],
};

export const COOLDOWN = {
  ar: ['تمدد الفخذ الأمامي — 30 ثانية لكل ساق', 'تمدد خلف الفخذ — 30 ثانية', 'وضعية الطفل — 30 ثانية', 'تنفّس عميق — دقيقة'],
  fr: ['Étirement quadriceps — 30 s/jambe', 'Étirement ischios — 30 s', 'Posture de l’enfant — 30 s', 'Respiration profonde — 1 min'],
};

export const WORKOUTS = [
  {
    id: 'A',
    name: { ar: 'الحصة A — الجسم كاملاً', fr: 'Séance A — Corps complet' },
    duration: 30,
    exercises: ['squat', 'inclinePushup', 'gluteBridge', 'backpackRow', 'plank', 'deadBug'],
  },
  {
    id: 'B',
    name: { ar: 'الحصة B — الجسم كاملاً + البطن', fr: 'Séance B — Corps complet + abdos' },
    duration: 30,
    exercises: ['reverseLunge', 'kneePushup', 'superman', 'backpackRow', 'reverseCrunch', 'sidePlank'],
  },
  {
    id: 'C',
    name: { ar: 'الحصة C — قوة + تحمّل', fr: 'Séance C — Force + endurance' },
    duration: 30,
    exercises: ['wallSit', 'pikePushup', 'goodMorning', 'birdDog', 'mountainClimber', 'plank'],
  },
];

// Weekly schedule starting Saturday (JS getDay: 6=Sat … 5=Fri).
export const SCHEDULE = {
  6: { type: 'workout', id: 'A' },
  0: { type: 'walk' },
  1: { type: 'workout', id: 'B' },
  2: { type: 'walk' },
  3: { type: 'workout', id: 'C' },
  4: { type: 'walk' },
  5: { type: 'rest' },
};

export const WALK_MINUTES = [25, 30, 40];

// ---------- Meals ----------
// Estimates only (kcal, protein g, cost in DZD). Prices vary by city and season.
const m = (ar, fr, kcal, p) => ({ ar, fr, kcal, p });

export const MEAL_SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'];

export const MEAL_DAYS = [
  {
    name: { ar: 'يوم العدس', fr: 'Jour lentilles' },
    cost: 700,
    meals: {
      breakfast: m('عجة 3 بيضات بالطماطم والبصل + ربع كسرة + شاي بدون سكر', 'Omelette 3 œufs tomate-oignon + ¼ kesra + thé sans sucre', 430, 23),
      lunch: m('طبق عدس بالجزر (كوب ونصف) + 150غ صدر دجاج مشوي + سلطة + ثلث خبزة', 'Lentilles aux carottes (1,5 tasse) + 150 g blanc de poulet grillé + salade + ⅓ baguette', 780, 62),
      snack: m('كوب لبن + 3 تمرات + حفنة كاوكاو (25غ)', 'Verre de lben + 3 dattes + poignée de cacahuètes (25 g)', 380, 15),
      dinner: m('شوربة خضر + 3 بيض مسلوق + ياغورت + شريحة خبز أسمر', 'Soupe de légumes + 3 œufs durs + yaourt + 1 tranche de pain complet', 600, 33),
    },
  },
  {
    name: { ar: 'يوم اللوبيا', fr: 'Jour loubia' },
    cost: 650,
    meals: {
      breakfast: m('بوليا شوفان (70غ) بالحليب + موزة + بيضتان مسلوقتان', 'Porridge d’avoine (70 g) au lait + banane + 2 œufs durs', 600, 30),
      lunch: m('لوبيا بيضاء بالطماطم (كوب ونصف) + 100غ دجاج + سلطة + ثلث خبزة', 'Loubia (haricots blancs) 1,5 tasse + 100 g poulet + salade + ⅓ baguette', 750, 48),
      snack: m('رايب + برتقالة + حفنة كاوكاو', 'Raïb + orange + poignée de cacahuètes', 380, 16),
      dinner: m('دجاج بالخضر في الفرن (150غ دجاج) + بطاطا صغيرة', 'Poulet aux légumes au four (150 g) + petite pomme de terre', 520, 43),
    },
  },
  {
    name: { ar: 'يوم السردين', fr: 'Jour sardines' },
    cost: 750,
    meals: {
      breakfast: m('3 بيضات مسلوقة + جبن خفيف + خبز أسمر (شريحتان) + خيار', '3 œufs durs + fromage léger + 2 tranches pain complet + concombre', 450, 30),
      lunch: m('سردين مشوي أو في الفرن (250غ) + سلطة مشوية (فلفل وطماطم) + ثلث خبزة', 'Sardines grillées/au four (250 g) + salade méchouia + ⅓ baguette', 780, 55),
      snack: m('كوب حليب + 2 تمر + حفنة كاوكاو', 'Verre de lait + 2 dattes + poignée de cacahuètes', 380, 16),
      dinner: m('عجة بطاطا بالفرن (3 بيض) + سلطة + ياغورت', 'Omelette pommes de terre au four (3 œufs) + salade + yaourt', 640, 31),
    },
  },
  {
    name: { ar: 'يوم الكسكسي', fr: 'Jour couscous' },
    cost: 700,
    meals: {
      breakfast: m('بوليا شوفان بالحليب + تفاحة + بيضتان مسلوقتان', 'Porridge d’avoine au lait + pomme + 2 œufs durs', 550, 28),
      lunch: m('كسكسي بالخضر والدجاج (كوب كسكسي مطبوخ + 180غ دجاج + خضر كثيرة)', 'Couscous légumes-poulet (1 tasse de graine cuite + 180 g poulet + beaucoup de légumes)', 820, 56),
      snack: m('كوب لبن', 'Verre de lben', 180, 9),
      dinner: m('شكشوكة بـ 3 بيض + ربع كسرة + ياغورت', 'Chakchouka avec 3 œufs + ¼ kesra + yaourt', 620, 32),
    },
  },
  {
    name: { ar: 'يوم الشوربة', fr: 'Jour chorba' },
    cost: 700,
    meals: {
      breakfast: m('عجة 3 بيضات بالبقدونس + خبز أسمر + شاي', 'Omelette 3 œufs persil + pain complet + thé', 420, 24),
      lunch: m('شوربة فريك بالدجاج (صحنان، 150غ دجاج) + سلطة + ثلث خبزة', 'Chorba frik au poulet (2 bols, 150 g poulet) + salade + ⅓ baguette', 720, 50),
      snack: m('ياغورت + موزة + حفنة كاوكاو', 'Yaourt + banane + poignée de cacahuètes', 380, 14),
      dinner: m('سلطة تونة (علبة تونة مصفّاة) بالأرز (كوب) والطماطم والذرة + بيضة', 'Salade de thon (1 boîte égouttée), riz (1 tasse), tomates, maïs + 1 œuf', 680, 44),
    },
  },
  {
    name: { ar: 'يوم الحمص', fr: 'Jour pois chiches' },
    cost: 650,
    meals: {
      breakfast: m('بوليا شوفان بالحليب + 2 تمر + بيضتان مسلوقتان', 'Porridge d’avoine au lait + 2 dattes + 2 œufs durs', 540, 28),
      lunch: m('مرقة حمص بالخضر (كوب ونصف) + 150غ دجاج + سلطة + ثلث خبزة', 'Ragoût de pois chiches (1,5 tasse) + 150 g poulet + salade + ⅓ baguette', 800, 58),
      snack: m('رايب + حفنة كاوكاو', 'Raïb + poignée de cacahuètes', 300, 14),
      dinner: m('دولمة كوسة بالفرن (لحم مفروم قليل) + ياغورت', 'Courgettes farcies au four (peu de viande hachée) + yaourt', 520, 28),
    },
  },
  {
    name: { ar: 'يوم الأرز والدجاج', fr: 'Jour riz-poulet' },
    cost: 700,
    meals: {
      breakfast: m('3 بيضات + جبن + طماطم + ربع كسرة', '3 œufs + fromage + tomate + ¼ kesra', 460, 28),
      lunch: m('أرز (كوب ونصف مطبوخ) بالخضر + 150غ دجاج متبّل بالفرن + سلطة', 'Riz (1,5 tasse cuit) aux légumes + 150 g poulet épicé au four + salade', 750, 48),
      snack: m('كوب حليب + برتقالة + حفنة كاوكاو', 'Verre de lait + orange + poignée de cacahuètes', 370, 16),
      dinner: m('شوربة عدس + 3 بيض مسلوق', 'Soupe de lentilles + 3 œufs durs', 580, 36),
    },
  },
];

export const SHOPPING = {
  ar: [
    ['البروتين', '30 بيضة، 1.5 كغ دجاج، 1 كغ سردين (حسب السوق)، 2 علب تونة'],
    ['البقوليات والحبوب', '500غ عدس، 500غ لوبيا بيضاء، 500غ حمص، 500غ فريك، 500غ كسكسي، 500غ أرز، 500غ شوفان'],
    ['الحليب ومشتقاته', '4 لتر حليب، 3–4 لتر لبن/رايب، 7 ياغورت، جبن خفيف'],
    ['الخضر', '2 كغ بطاطا، 2 كغ طماطم، 1 كغ بصل، جزر، فلفل، كوسة، خيار، سلطة، بقدونس'],
    ['الفواكه', 'موز، برتقال أو فاكهة الموسم، 500غ تمر'],
    ['أخرى', 'خبز/كسرة باعتدال، 250غ كاوكاو، زيت زيتون، توابل (كمون، فلفل أحمر، رأس الحانوت، ثوم)'],
  ],
  fr: [
    ['Protéines', '30 œufs, 1,5 kg poulet, 1 kg sardines (selon marché), 2 boîtes de thon'],
    ['Légumineuses & céréales', '500 g lentilles, 500 g haricots blancs, 500 g pois chiches, 500 g frik, 500 g couscous, 500 g riz, 500 g flocons d’avoine'],
    ['Produits laitiers', '4 L lait, 3–4 L lben/raïb, 7 yaourts, fromage léger'],
    ['Légumes', '2 kg pommes de terre, 2 kg tomates, 1 kg oignons, carottes, poivrons, courgettes, concombre, salade, persil'],
    ['Fruits', 'Bananes, oranges ou fruits de saison, 500 g dattes'],
    ['Autres', 'Pain/kesra avec modération, 250 g cacahuètes, huile d’olive, épices (cumin, paprika, ras el hanout, ail)'],
  ],
};

export const NUTRITION_TIPS = {
  ar: [
    'لا يمكن حرق الدهون من منطقة واحدة فقط: دهون أسفل البطن تقل مع نقص الدهون في الجسم كله.',
    'قلّل المشروبات الغازية والعصائر المصنّعة والحلويات اليومية.',
    'قلّل المقليات (البوراك، المحاجب، الفريت) واطبخ بالفرن أو المرق.',
    'تحكّم في كمية الخبز: ثلث خبزة أو ربع كسرة في الوجبة.',
    'اشرب الماء قبل الوجبات وامشِ 10 دقائق بعد الأكل.',
    'نم 7–9 ساعات: قلة النوم تزيد الجوع وتصعّب بناء العضلات.',
  ],
  fr: [
    'On ne peut pas brûler la graisse d’un seul endroit : le bas du ventre diminue avec la perte de graisse globale.',
    'Limitez sodas, jus industriels et sucreries quotidiennes.',
    'Limitez les fritures (bourek, mhadjeb, frites) : préférez four et sauces.',
    'Contrôlez le pain : ⅓ de baguette ou ¼ de kesra par repas.',
    'Buvez de l’eau avant les repas et marchez 10 min après.',
    'Dormez 7–9 h : le manque de sommeil augmente la faim et freine le muscle.',
  ],
};

export function dayTotals(day) {
  return MEAL_SLOTS.reduce(
    (acc, s) => ({ kcal: acc.kcal + day.meals[s].kcal, p: acc.p + day.meals[s].p }),
    { kcal: 0, p: 0 },
  );
}

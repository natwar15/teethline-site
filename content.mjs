// Teethline site content — single source of truth for every page.
// The weekly self-improvement task edits THIS file (and content/learned.json),
// then runs `node src/build.mjs`. Keep clinical safety text (SAFETY) unchanged
// unless Natwar approves it.

export const SITE = {
  name: 'Teethline',
  url: 'https://teethline.co.uk',
  tagline: 'NHS urgent dental care in Leeds, Bradford and Ripon',
  operator: 'Smile Oasis (Leeds) Limited',
  operatorAddress: 'Chester House, Lloyd Drive, Ellesmere Port, CH65 9HQ',
  ico: 'ZC002378',
  email: 'natwar@me.com',
  provider: 'Natwarlal Tibrewal',
  urgentCharge: '£27.90',
  bookUtm: '?utm_source=teethline&utm_medium=referral&utm_campaign=emergency_booking',
  chargeSince: '1 April 2026',
  reviewed: '2026-11-20',
  googleVerification: '94ltpUQbBmLdRCBZRBbIVu7694rNkwJs_Oc473QCJ-E',
};

// Verified 20 Nov 2026 against nhs.uk service profiles and CQC.
export const CLINICS = [
  {
    id: 'corner',
    book: 'https://corner-house-dental.portal.dental/',
    slug: 'corner-house-dental-leeds',
    name: 'Corner House Dental Practice',
    city: 'Leeds',
    area: 'Moortown',
    street: '5–6 Corner House Shops, Moortown Corner',
    postcode: 'LS17 6LD',
    region: 'West Yorkshire',
    phone: '0113 266 5184',
    tel: '+441132665184',
    lat: 53.8616, lng: -1.5278,
    hours: [['Mo-Fr', '09:00', '12:30'], ['Mo-Fr', '14:00', '16:30']],
    hoursText: 'Monday to Friday, 9am–12:30pm and 2pm–4:30pm. Closed weekends.',
    ods: 'V03459',
    nhsUrl: 'https://www.nhs.uk/services/dentist/corner-house-dental-practice/V003459',
    cqcUrl: 'https://www.cqc.org.uk/location/1-451574078',
    nearby: ['Moortown', 'Alwoodley', 'Roundhay', 'Chapel Allerton', 'Meanwood', 'Shadwell', 'Headingley', 'Adel'],
    blurb: 'A long-established NHS practice at Moortown Corner in north Leeds, treating adults and children on the NHS and privately.',
  },
  {
    id: 'aone',
    book: 'https://a-one-dental.portal.dental/',
    slug: 'a-one-dental-bradford',
    name: 'A One Dental Practice',
    city: 'Bradford',
    area: 'Thornbury',
    street: '983 Leeds Road, Thornbury',
    postcode: 'BD3 7ND',
    region: 'West Yorkshire',
    phone: '01274 664635',
    tel: '+441274664635',
    lat: 53.7997, lng: -1.7271,
    hours: [['Mo-Th', '09:00', '17:00'], ['Fr', '09:00', '16:00']],
    hoursText: 'Monday to Thursday 9am–5pm, Friday 9am–4pm. Closed weekends.',
    ods: 'V02960',
    nhsUrl: 'https://www.nhs.uk/services/dentist/a-one-dental-practice/V002960',
    cqcUrl: 'https://www.cqc.org.uk/location/1-6306640526',
    nearby: ['Thornbury', 'Laisterdyke', 'Bradford Moor', 'Pudsey', 'Stanningley', 'Calverley', 'Eccleshill', 'Idle'],
    blurb: 'An NHS family practice on Leeds Road in Thornbury, east Bradford, with a bus stop outside and parking nearby.',
  },
  {
    id: 'bridge',
    book: 'https://bridge-house.portal.dental/',
    slug: 'bridge-house-dental-ripon',
    name: 'Bridge House Dental Practice',
    city: 'Ripon',
    area: 'Bondgate Green',
    street: 'Bridge House, 29 Bondgate Green',
    postcode: 'HG4 1QW',
    region: 'North Yorkshire',
    phone: '01765 603215',
    tel: '+441765603215',
    lat: 54.1373, lng: -1.5225,
    hours: [['Mo-Fr', '09:00', '13:00'], ['Mo-Fr', '14:00', '17:00']],
    hoursText: 'Monday to Friday, 9am–1pm and 2pm–5pm. Closed weekends.',
    ods: 'V04378',
    nhsUrl: 'https://www.nhs.uk/services/dentist/bridge-house-dental-practice/V004378',
    cqcUrl: 'https://www.cqc.org.uk/location/1-2631768995',
    nearby: ['Ripon', 'Boroughbridge', 'Masham', 'Bedale', 'Thirsk', 'Pateley Bridge', 'Knaresborough', 'Harrogate'],
    blurb: 'A four-surgery NHS practice by the canal at Bondgate Green in Ripon, with level access for wheelchairs and pushchairs.',
  },
];

// Safety triage text — clinical, do not let automation rewrite.
export const SAFETY = {
  call999: [
    'Swelling in your face, mouth or neck that is making it hard to breathe, swallow or speak',
    'Swelling spreading to your eye or down your neck',
    'Bleeding from the mouth that will not stop after 20 minutes of firm pressure',
    'A serious injury to your face, jaw or head',
  ],
  call111: [
    'You need urgent dental help and the practice is closed (evenings, weekends, bank holidays)',
    'You have a high temperature with dental pain or swelling',
    'You are not sure how urgent it is and want advice now',
  ],
};

export const AREAS = [
  { slug: 'emergency-dentist-leeds', town: 'Leeds', clinic: 'corner', lat: 53.8008, lng: -1.5491,
    intro: 'Corner House Dental Practice in Moortown is our NHS urgent dental practice in Leeds. It is in north Leeds at Moortown Corner, close to the Ring Road and on the main bus routes along Harrogate Road and Street Lane.' },
  { slug: 'emergency-dentist-bradford', town: 'Bradford', clinic: 'aone', lat: 53.7950, lng: -1.7594,
    intro: 'A One Dental Practice on Leeds Road in Thornbury is our NHS urgent dental practice in Bradford. It is about two miles east of the city centre, with a bus stop nearby and off-site parking.' },
  { slug: 'emergency-dentist-ripon', town: 'Ripon', clinic: 'bridge', lat: 54.1386, lng: -1.5240,
    intro: 'Bridge House Dental Practice at Bondgate Green is our NHS urgent dental practice in Ripon, a short walk from the city centre with on-street parking nearby.' },
  { slug: 'emergency-dentist-harrogate', town: 'Harrogate', clinic: 'bridge', alt: 'corner', lat: 53.9921, lng: -1.5418,
    intro: 'We do not have a practice in Harrogate itself. Our nearest NHS practices are Bridge House in Ripon to the north and Corner House in Moortown, north Leeds, to the south. Both are around 10 miles away.' },
];

// Guides: answer-first, short, NHS-aligned. `body` is HTML.
export const GUIDES = [
  {
    slug: 'toothache', title: 'Severe toothache: what to do and when to get urgent help',
    short: 'Severe toothache',
    problem: 'toothache',
    answer: 'For severe toothache, take paracetamol or ibuprofen as the packet says, avoid very hot, cold or sweet food, and contact an NHS dentist for an urgent appointment. Get help the same day if the pain stops you sleeping, or if you have swelling or a high temperature. Call 999 if swelling makes it hard to breathe or swallow.',
    body: `
<h2>What you can do now</h2>
<ul>
<li>Take paracetamol or ibuprofen, following the dose on the packet. Ask a pharmacist if you are unsure which is safe for you, for example if you have asthma, stomach problems or are pregnant.</li>
<li>Do not put aspirin or clove oil directly on the gum. It can burn the gum.</li>
<li>Rinse with warm salty water and keep the area clean by brushing gently.</li>
<li>Avoid very hot, cold or sugary food and drink, and chew on the other side.</li>
<li>Sleep with your head raised on an extra pillow. Throbbing often feels worse lying flat.</li>
</ul>
<h2>How urgent is it?</h2>
<p><strong>Same day:</strong> pain that keeps you awake or is not controlled by painkillers, swelling in the gum or face, a bad taste or pus, or a high temperature. These can be signs of an abscess.</p>
<p><strong>Within a few days:</strong> pain that comes and goes, or sharp pain only with hot or cold drinks.</p>
<h2>Why toothache happens</h2>
<p>Most severe toothache is caused by decay reaching the nerve, a cracked tooth, a lost filling, gum infection or an infected wisdom tooth. Painkillers ease the pain but do not fix the cause, so you still need a dentist to look at it. Antibiotics alone do not cure tooth pain and are only used when infection is spreading.</p>`,
  },
  {
    slug: 'dental-abscess', title: 'Dental abscess: symptoms, what to do and when it is an emergency',
    short: 'Dental abscess', problem: 'toothache',
    answer: 'A dental abscess is a build-up of pus from a tooth or gum infection. It usually causes intense throbbing pain, swelling, a bad taste and sometimes a high temperature. You need an urgent dental appointment, ideally the same day. Call 999 or go to A&E if the swelling spreads to your eye or neck or makes it hard to breathe or swallow.',
    body: `
<h2>Common signs</h2>
<ul>
<li>Intense, throbbing pain that can spread to your ear, jaw or neck</li>
<li>Swelling in the gum or face, a bad taste or pus</li>
<li>A tooth that is tender to bite on or feels loose</li>
<li>Feeling generally unwell or having a high temperature</li>
</ul>
<h2>What you can do now</h2>
<ul>
<li>Take paracetamol or ibuprofen as the packet says.</li>
<li>Rinse with warm salty water. Do not try to burst the swelling yourself.</li>
<li>Use a soft toothbrush and avoid chewing on that side.</li>
</ul>
<h2>What the dentist will do</h2>
<p>An abscess will not clear up on its own. The dentist drains the infection, usually by opening the tooth for root canal treatment or by removing it. Antibiotics may be added if infection is spreading or you are unwell, but they are not a substitute for treatment. Urgent NHS treatment is charged at the Band 1 rate.</p>`,
  },
  {
    slug: 'knocked-out-tooth', title: 'Knocked-out tooth: what to do in the first hour',
    short: 'Knocked-out tooth', problem: 'avulsion',
    answer: 'If an adult tooth is knocked out, hold it by the white crown, not the root. If it is dirty, rinse it briefly in milk or cold water, then push it back into the socket and bite on a clean cloth. If you cannot put it back, keep it in milk and see a dentist straight away. The best chance of saving it is within one hour. Do not put a baby tooth back in.',
    body: `
<h2>Adult (permanent) tooth</h2>
<ol>
<li>Find the tooth and pick it up by the crown (the part you normally see). Do not touch the root.</li>
<li>If it is dirty, rinse it for a few seconds in milk, saline or cold running water. Do not scrub it or use soap.</li>
<li>Push it gently back into the socket, the right way round, and bite on a clean cloth or handkerchief to hold it in place.</li>
<li>If you cannot replant it, put it in a small container of milk. An adult can also keep it inside their cheek, but do not do this with a child because they could swallow it.</li>
<li>Contact a dentist immediately. Time matters: a tooth replanted within an hour has the best chance of surviving.</li>
</ol>
<h2>Baby tooth</h2>
<p>Do not put a knocked-out baby tooth back in, as it can damage the adult tooth growing underneath. Control bleeding by pressing on a clean cloth and contact a dentist for a check.</p>
<h2>When to go to A&amp;E</h2>
<p>Go to A&amp;E or call 999 if there is a head injury, loss of consciousness, a possible broken jaw or bleeding that will not stop.</p>`,
  },
  {
    slug: 'broken-or-chipped-tooth', title: 'Broken or chipped tooth: what to do and how urgent it is',
    short: 'Broken or chipped tooth', problem: 'fracture',
    answer: 'For a broken or chipped tooth, rinse your mouth with warm water, keep any broken piece in milk or water, and cover a sharp edge with sugar-free gum or dental wax from a pharmacy. If the break is large, painful, or you can see pink or red in the middle of the tooth, you need an urgent appointment the same day. A small painless chip can usually wait a few days.',
    body: `
<h2>What you can do now</h2>
<ul>
<li>Rinse your mouth gently with warm water.</li>
<li>Keep any broken pieces in milk or water and bring them with you.</li>
<li>Cover a sharp edge with sugar-free chewing gum or dental wax to protect your tongue and cheek.</li>
<li>Take paracetamol or ibuprofen for pain, following the packet.</li>
<li>Hold a cold compress against your face if there is swelling after an injury.</li>
</ul>
<h2>How urgent is it?</h2>
<p><strong>Same day:</strong> a large break, severe pain, pink or red visible in the break (the nerve may be exposed), or the break happened in an accident or fall.</p>
<p><strong>Within a few days:</strong> a small chip with no pain, or slight sensitivity to cold.</p>`,
  },
  {
    slug: 'lost-filling-or-crown', title: 'Lost filling or crown: what to do until you see a dentist',
    short: 'Lost filling or crown', problem: 'filling',
    answer: 'If a filling or crown falls out, keep the crown safe, keep the area clean, and use a temporary filling kit from a pharmacy to cover the hole or refit the crown. Do not use household glue. It is not usually an emergency unless you are in severe pain, but book a dental appointment within a few days.',
    body: `
<h2>What you can do now</h2>
<ul>
<li>Keep the crown in a clean container and bring it with you. It can often be cemented back on.</li>
<li>Pharmacies sell temporary filling and crown cement kits. Follow the instructions carefully.</li>
<li>Never use superglue or other household glue in your mouth.</li>
<li>Brush gently around the area and avoid sticky or hard food on that side.</li>
</ul>
<h2>When it becomes urgent</h2>
<p>Ask for an urgent appointment if you have severe or constant pain, swelling, or a sharp broken edge that is cutting your tongue or cheek.</p>`,
  },
  {
    slug: 'bleeding-after-tooth-extraction', title: 'Bleeding after a tooth extraction: how to stop it',
    short: 'Bleeding after an extraction', problem: 'bleeding',
    answer: 'To stop bleeding after a tooth extraction, roll up a clean damp gauze or handkerchief, place it over the socket and bite down firmly for 20 minutes without checking. Sit upright and do not rinse, spit or drink hot drinks. If it is still bleeding heavily after two rounds of firm pressure, contact the dentist who took the tooth out or NHS 111. Call 999 if bleeding is heavy and will not stop.',
    body: `
<h2>Step by step</h2>
<ol>
<li>Sit upright. Do not lie flat.</li>
<li>Gently remove any loose clot sitting above the gum.</li>
<li>Roll a clean, damp piece of gauze or a cotton handkerchief into a firm pad.</li>
<li>Place it over the socket and bite down hard for 20 minutes. Do not keep checking.</li>
<li>Repeat once more if needed.</li>
</ol>
<h2>For the next 24 hours</h2>
<ul>
<li>Do not rinse your mouth, spit, smoke or drink alcohol.</li>
<li>Avoid hot drinks and hot food, and do not exercise hard.</li>
<li>Some pink-stained saliva is normal for a day or two.</li>
</ul>
<h2>Get help if</h2>
<p>Contact the practice that did the extraction, or NHS 111 if it is closed, if bleeding is still heavy after two lots of firm pressure. Call 999 if you are losing a lot of blood, feel faint, or the bleeding will not stop.</p>`,
  },
  {
    slug: 'wisdom-tooth-pain', title: 'Wisdom tooth pain and swelling: what to do',
    short: 'Wisdom tooth pain', problem: 'toothache',
    answer: 'Painful swelling around a wisdom tooth is usually a gum infection called pericoronitis. Rinse with warm salty water, brush the area gently, and take paracetamol or ibuprofen. Contact a dentist if it does not settle within two or three days, or straight away if you have facial swelling, find it hard to open your mouth or swallow, or have a high temperature.',
    body: `
<h2>What you can do now</h2>
<ul>
<li>Rinse with warm salty water several times a day, especially after eating.</li>
<li>Keep brushing the area gently with a soft brush to clear trapped food.</li>
<li>Take paracetamol or ibuprofen following the packet.</li>
</ul>
<h2>Get an urgent appointment if</h2>
<ul>
<li>Your face or jaw is swollen</li>
<li>It is hard to open your mouth, or painful to swallow</li>
<li>You have a high temperature or feel unwell</li>
</ul>
<p>Call 999 if swelling is affecting your breathing or swallowing.</p>`,
  },
  {
    slug: 'childrens-dental-emergency', title: "Children's dental emergencies: what to do",
    short: "Children's dental emergency", problem: 'other',
    answer: "If your child has toothache, a dental injury or facial swelling, give children's paracetamol or ibuprofen as the packet says for their age, and contact an NHS dentist for an urgent appointment. NHS dental treatment is free for under-18s. Do not put a knocked-out baby tooth back in. Call 999 if swelling affects breathing or swallowing, or after a serious head injury.",
    body: `
<h2>Toothache or swelling</h2>
<p>Give children's paracetamol or ibuprofen at the dose on the packet for your child's age. Swelling of the face in a child needs to be seen the same day.</p>
<h2>Knocked-out or broken teeth</h2>
<ul>
<li><strong>Baby tooth knocked out:</strong> do not put it back. Press a clean cloth on the gum to stop bleeding and see a dentist.</li>
<li><strong>Adult tooth knocked out</strong> (usually from about age 6 to 7): follow our <a href="/guides/knocked-out-tooth/">knocked-out tooth guide</a> and get to a dentist within the hour.</li>
<li><strong>Broken tooth:</strong> keep any pieces in milk and see a dentist the same day.</li>
</ul>
<h2>Cost</h2>
<p>NHS dental treatment is free for children under 18, and for under-19s in full-time education.</p>`,
  },
  {
    slug: 'when-to-call-999-or-111', title: 'Dental emergency: when to call 999, NHS 111 or a dentist',
    short: '999, 111 or a dentist?', problem: 'other',
    answer: 'Call 999 or go to A&E for facial swelling that affects breathing, swallowing or your eye, bleeding that will not stop, or a serious face or jaw injury. Call NHS 111 if you need urgent dental help when practices are closed. For everything else, including severe toothache, an abscess, or a broken or knocked-out tooth, contact an NHS dentist for an urgent appointment.',
    body: `
<h2>Call 999 or go to A&amp;E</h2>
<ul>${SAFETY_LIST('call999')}</ul>
<h2>Call NHS 111</h2>
<ul>${SAFETY_LIST('call111')}</ul>
<h2>Contact an NHS dentist</h2>
<p>For severe toothache, an abscess without breathing or swallowing problems, a broken or knocked-out tooth, or a lost filling or crown, contact an NHS dental practice for an urgent appointment. You do not need to be registered with a practice to get urgent NHS dental care. Your GP cannot provide dental treatment.</p>`,
  },
];

function SAFETY_LIST(k) {
  return SAFETY[k].map((s) => `<li>${s}</li>`).join('');
}

export const FAQS = [
  ['Do I need to be registered with a dentist to get urgent NHS dental care?',
   'No. In England there is no registration with an NHS dentist, and any NHS practice can offer you a one-off urgent appointment if it has capacity. You do not need a referral.'],
  ['How much does an urgent NHS dental appointment cost?',
   `Since ${SITE.chargeSince}, urgent NHS dental treatment in England costs ${SITE.urgentCharge} (the Band 1 charge). It is free if you are under 18, under 19 in full-time education, pregnant or have had a baby in the last 12 months, or receive certain benefits.`],
  ['Is Teethline part of the NHS?',
   `No. Teethline is a free triage and referral service run by ${SITE.operator}. Our three partner practices are NHS-contracted, CQC-registered dental practices in Leeds, Bradford and Ripon, all run by ${SITE.provider}.`],
  ['Does Teethline charge anything?',
   'No. Using Teethline is free. You only pay the practice the standard NHS charge for your treatment, unless you are exempt.'],
  ['Can I book an emergency NHS appointment online?',
   'Yes. All three practices release emergency appointment slots every working day (Monday to Friday) that anyone can book online, whether or not you are registered with the practice. Choose your practice and pick a time. If there are no slots left that suit you, send us your symptoms with the triage and the practice will call you back.'],
  ['If I use the triage instead of booking, how quickly will the practice call me?',
   'The practice receives your triage by NHS email straight away and calls you during opening hours, Monday to Friday. Time-critical cases are flagged as priority. Urgent NHS slots are limited, so we cannot guarantee a same-day appointment.'],
  ['What if I need help in the evening or at the weekend?',
   'Our practices are open, and emergency slots are available, Monday to Friday only. Outside those hours, call NHS 111, which can book you into an out-of-hours urgent dental service. Call 999 if swelling affects your breathing or swallowing.'],
  ['Which areas do you cover?',
   'Our practices are in Moortown (north Leeds), Thornbury (east Bradford) and Ripon. Patients often come from nearby areas including Alwoodley, Roundhay, Pudsey, Harrogate, Boroughbridge and Thirsk.'],
  ['Can I just phone the practice instead?',
   'Yes. Every practice phone number is on this site. You can also book an emergency slot online, which is usually quickest.'],
  ['What happens to my information?',
   `Your triage is stored securely in the UK and sent only to the practice you choose. We are registered with the Information Commissioner's Office (${SITE.ico}). Read our <a href="/privacy/">privacy policy</a> for details.`],
];

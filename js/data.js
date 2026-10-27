/*
 * ARC prototype: single source of truth for editable content.
 * The public site (main.js) and the demo CMS (admin.js) both read this.
 * Admin edits are stored in localStorage ("arc_demo_overrides") and merged
 * over these defaults in the same browser only.
 *
 * IMPORTANT: every number, address and opening time here must be verified
 * with ARC before any public use.
 */
window.ARC_DATA = {
  site: {
    name: "Adult Rape Clinic",
    shortName: "ARC",
    email: "[info@... confirm]",
    office: "Ward C9, Parirenyatwa Hospital, Mazowe Street, Harare",
    pageCount: 15
  },

  hotlines: [
    { id: "tollfree", label: "24-Hour Toll-Free Line", number: "08080472", tel: "08080472", note: "Free for Econet", primary: true, whatsapp: false },
    { id: "allnetworks", label: "All networks", number: "0775 672 770", tel: "+263775672770", note: "Also on WhatsApp", primary: false, whatsapp: false },
    { id: "whatsapp", label: "WhatsApp", number: "+263 775 672 770", tel: "+263775672770", note: "Message us on WhatsApp", primary: false, whatsapp: true },
    { id: "office", label: "Office landline", number: "+263 242 793572", tel: "+263242793572", note: "", primary: false, whatsapp: false },
    { id: "additional", label: "Additional line", number: "+263 733 406 292", tel: "+263733406292", note: "", primary: false, whatsapp: false },
    { id: "gbv", label: "National GBV Call Centre", number: "575", tel: "575", note: "National short code", primary: false, whatsapp: false },
    { id: "police", label: "Police / emergency", number: "999", tel: "999", note: "National emergency", primary: false, whatsapp: false }
  ],

  locations: [
    { id: "harare", city: "Harare", name: "Harare (main clinic)", address: "Ward C9, Parirenyatwa Hospital, Mazowe Street, Harare", hours: "[Confirm with ARC]", phone: "+263 242 793572" },
    { id: "kadoma", city: "Kadoma", name: "Kadoma", address: "Rimuka Clinic, Kadoma", hours: "[Confirm with ARC]", phone: "0775 672 770" },
    { id: "gokwe", city: "Gokwe", name: "Gokwe", address: "Gokwe South District Hospital, Gokwe", hours: "[Confirm with ARC]", phone: "0775 672 770" },
    { id: "masvingo", city: "Masvingo", name: "Masvingo", address: "Stand 401, Nemanwa, Masvingo", hours: "[Confirm with ARC]", phone: "0775 672 770" },
    { id: "mutare", city: "Mutare", name: "Mutare", address: "8810 Magamba Road, Mountain Rise, Chikanga, Mutare", hours: "[Confirm with ARC]", phone: "0775 672 770" }
  ],

  stats: [
    { id: "monthly", label: "New survivors supported every month", value: "40+" },
    { id: "since2009", label: "Survivors helped since 2009", value: "[Figure]" },
    { id: "officers", label: "Officers trained", value: "[Figure]" },
    { id: "outreach", label: "Outreach sessions", value: "[Figure]" }
  ],

  services: [
    { id: "medical", title: "Medical examination and treatment", summary: "A private, gentle examination by a trained nurse or doctor, and treatment for any injuries. You decide what happens at each step.", icon: "heart" },
    { id: "pep", title: "PEP to reduce the risk of HIV", summary: "Post-exposure prophylaxis (PEP) is medicine that lowers the chance of HIV infection. It works best when started as soon as possible, within 72 hours.", icon: "shield" },
    { id: "contraception", title: "Emergency contraception", summary: "Medicine to help prevent an unwanted pregnancy. It works best the sooner it is taken.", icon: "pill" },
    { id: "sti", title: "STI testing and treatment", summary: "Confidential testing and treatment for sexually transmitted infections, with follow-up visits if needed.", icon: "test" },
    { id: "hiv", title: "HIV testing and counselling", summary: "Free, confidential HIV testing with a counsellor who will explain each result and what it means for you.", icon: "chat" },
    { id: "forensic", title: "Evidence collection and medical affidavits", summary: "If you choose, we can collect forensic evidence and complete the medical affidavit needed for a court case.", icon: "clipboard" },
    { id: "counselling", title: "Counselling and psychotherapy", summary: "Someone to talk to, now and later. We offer short-term and long-term counselling and psychotherapy.", icon: "users" },
    { id: "referrals", title: "Referrals to police and legal support", summary: "If and when you want to report, we can support you and refer you to the Victim Friendly Unit and legal help.", icon: "scale" },
    { id: "training", title: "Training and awareness programmes", summary: "Training for police officers, health workers and community leaders, and awareness sessions in schools, churches and communities.", icon: "info" }
  ],

  posts: [
    {
      id: "p1",
      title: "ARC marks 16 Days of Activism",
      date: "2025-11-25",
      excerpt: "Staff and partners joined community events across Harare to share information about free, confidential care after sexual violence.",
      body: "Each year the 16 Days of Activism against Gender-Based Violence run from 25 November to 10 December.\n\nThis year ARC staff joined partners at community events in Harare to share information about the free services available at our clinics, and about the importance of seeking care within 72 hours.\n\n## Getting the message out\n\nOur team handed out leaflets, answered questions and explained how to reach the 24-hour toll-free line.\n\nThank you to everyone who took part.",
      status: "published",
      author: "Communications team",
      image: "",
      alt: "",
      publishAt: "",
      sample: true
    },
    {
      id: "p2",
      title: "Outreach in Harare schools",
      date: "2025-09-12",
      excerpt: "Our outreach team visited secondary schools to talk about consent, safety and where young adults can find help.",
      body: "Our outreach team visited several secondary schools in Harare during the school term.\n\nSessions covered consent, personal safety, and where to find confidential help. Teachers also received information on how to support learners who disclose abuse.\n\n## Next steps\n\nWe plan to return next term with partner organisations.",
      status: "published",
      author: "Outreach team",
      image: "",
      alt: "",
      publishAt: "",
      sample: true
    },
    {
      id: "p3",
      title: "Training for Victim Friendly Unit officers",
      date: "2025-07-03",
      excerpt: "Police officers from the Victim Friendly Unit completed a training course on a survivor-centred response.",
      body: "Officers from the Zimbabwe Republic Police Victim Friendly Unit completed a training course facilitated by ARC.\n\nThe course covered a survivor-centred approach, how medical evidence is collected, and how to refer survivors for care within 72 hours.\n\n## Working together\n\nStrong links between health workers and police help survivors get the care and support they need.",
      status: "published",
      author: "Training team",
      image: "",
      alt: "",
      publishAt: "",
      sample: true
    },
    {
      id: "p4",
      title: "New awareness leaflets available",
      date: "2026-10-20",
      excerpt: "Updated leaflets explain what happens at the clinic, in plain language.",
      body: "We have updated our awareness leaflets so they are easier to read.\n\nThe leaflets explain what happens when you come to ARC, and how to reach the 24-hour toll-free line.",
      status: "review",
      author: "Demo Editor",
      image: "leaflets.jpg",
      alt: "",
      publishAt: "",
      sample: true
    }
  ],

  resources: [
    { id: "r1", title: "Know your rights after sexual assault", type: "Guide (PDF)", size: "420 KB", summaryUrl: "resources.html#summary-r1", fileUrl: "#",
      summary: "You have the right to free medical care, to be treated with respect, to privacy, and to decide whether to report to the police. You can bring someone you trust with you." },
    { id: "r2", title: "Annual Report [Year]", type: "Report (PDF)", size: "2.1 MB", summaryUrl: "resources.html#summary-r2", fileUrl: "#",
      summary: "A summary of ARC's work during the year: survivors supported, training delivered, outreach activities and finances. [Figures to be confirmed with ARC.]" },
    { id: "r3", title: "What happens at the clinic", type: "Leaflet (PDF)", size: "180 KB", summaryUrl: "resources.html#summary-r3", fileUrl: "#",
      summary: "A step-by-step guide: you arrive and are welcomed, you speak privately with a nurse or counsellor, you receive medical care, and you are offered ongoing support." },
    { id: "r4", title: "Supporting a friend or family member", type: "Leaflet (PDF)", size: "160 KB", summaryUrl: "resources.html#summary-r4", fileUrl: "#",
      summary: "Listen without judging, believe them, let them make their own choices, and help them reach care quickly. Look after yourself too." },
    { id: "r5", title: "Understanding PEP and the 72-hour window", type: "Fact sheet (PDF)", size: "140 KB", summaryUrl: "resources.html#summary-r5", fileUrl: "#",
      summary: "PEP is medicine that lowers the risk of HIV after exposure. It must be started within 72 hours, and the sooner the better. It is free at ARC." },
    { id: "r6", title: "16 Days of Activism awareness pack", type: "Toolkit (ZIP)", size: "3.4 MB", summaryUrl: "resources.html#summary-r6", fileUrl: "#",
      summary: "Posters, talking points and activity ideas for schools, churches and community groups taking part in the 16 Days of Activism." }
  ]
};

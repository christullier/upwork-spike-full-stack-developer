export const DEMO_TODAY = "2026-11-06";
export const DEMO_DATE_LABEL = "Nov 6, 2026";

export const STUDIOS = [
  {
    id: "gcs",
    name: "Gulf Coast Strength",
    initials: "GC",
    location: "Mobile, AL",
    plan: "Growth",
    owner: "Avery Cole",
  },
  {
    id: "bay",
    name: "Bayline Fitness",
    initials: "BF",
    location: "Pensacola, FL",
    plan: "Starter",
    owner: "Jules Park",
  },
];

export const ELIGIBILITY_RULES = [
  "Written SMS consent on file",
  "Last visit 90 or more days ago",
  "No contact in the last 30 days",
  "No visit already booked",
];

const lead = (id, name, phone, lastVisit, consent, lastContact, booking = null) => ({
  id,
  name,
  phone,
  lastVisit,
  consent,
  lastContact,
  booking,
});

export const seedLeads = {
  gcs: [
    lead("dana", "Dana Whitfield", "(251) 555-0142", "2026-05-02", "yes", "2026-06-01"),
    lead("marcus", "Marcus Bell", "(251) 555-0177", "2026-03-19", "yes", "2026-04-02"),
    lead("priya", "Priya Raman", "(251) 555-0119", "2026-01-08", "yes", "2026-02-11"),
    lead("tom", "Tom Escobar", "(251) 555-0163", "2026-04-27", "yes", "2026-09-20"),
    lead("lena", "Lena Fischer", "(251) 555-0128", "2026-10-01", "yes", "2026-10-05"),
    lead("ray", "Ray Doucet", "(251) 555-0195", "2026-02-14", "no", "2026-03-01"),
    lead("ana", "Ana Munoz", "(251) 555-0151", "2026-06-11", "no consent", null),
    lead("chris", "Chris Nolan", "(251) 555-0184", "2026-07-03", "yes", "2026-10-18", "2026-11-09"),
  ],
  bay: [
    lead("sofia", "Sofia Grant", "(850) 555-0210", "2026-04-14", "yes", "2026-05-20"),
    lead("owen", "Owen Hart", "(850) 555-0244", "2026-06-19", "yes", "2026-07-01"),
    lead("dev", "Dev Patel", "(850) 555-0226", "2026-10-12", "yes", "2026-10-14"),
    lead("nina", "Nina Brooks", "(850) 555-0231", "2026-02-02", "no", "2026-03-08"),
  ],
};

export const IMPORT_BATCH = [
  {
    name: "Jordan Ellis",
    phone: "(251) 555-0301",
    lastVisit: "2026-06-01",
    consent: "yes",
    lastContact: "2026-07-15",
    booking: null,
  },
  {
    name: "Maya Torres",
    phone: "(251) 555-0314",
    lastVisit: "2026-10-20",
    consent: "yes",
    lastContact: "2026-10-22",
    booking: null,
  },
  {
    name: "Ben Okafor",
    phone: "(251) 555-0329",
    lastVisit: "2026-05-05",
    consent: "no consent",
    lastContact: null,
    booking: null,
  },
  {
    name: "Erin Shaw",
    phone: "(251) 555-0338",
    lastVisit: "2026-03-12",
    consent: "yes",
    lastContact: "2026-09-01",
    booking: "2026-11-12",
  },
];

export const WINBACK_TEMPLATE =
  "Hi {{first_name}}, this is {{studio}}. We saved 2 free weeks for you. Reply YES and I will find a time.";

export const seedCampaigns = {
  gcs: {
    name: "We miss you — 2 free weeks",
    template: WINBACK_TEMPLATE,
    dailyLimit: 25,
    window: "10:00–19:00",
    status: "active",
    sentTo: ["dana", "marcus"],
    startedAt: "Mon 4:02 PM",
  },
  bay: {
    name: "We miss you — 2 free weeks",
    template: WINBACK_TEMPLATE,
    dailyLimit: 15,
    window: "09:00–18:00",
    status: "draft",
    sentTo: [],
    startedAt: null,
  },
};

const campaignMessage = (name, studio) =>
  `Hi ${name.split(" ")[0]}, this is ${studio.name}. We saved 2 free weeks for you. Reply YES and I will find a time.`;

export const seedConversations = {
  gcs: [
    {
      id: "conv-dana",
      leadId: "dana",
      name: "Dana Whitfield",
      phone: "(251) 555-0142",
      status: "booked",
      updated: "12m",
      messages: [
        {
          from: "campaign",
          text: campaignMessage("Dana Whitfield", STUDIOS[0]),
          time: "Mon 4:02 PM",
        },
        {
          from: "member",
          text: "YES — I've been meaning to get back in. Mornings are best.",
          time: "4:11 PM",
        },
        {
          from: "agent",
          text: "Great to hear from you, Dana. What did your old routine look like — strength, classes, or a mix?",
          time: "4:11 PM",
        },
        {
          from: "member",
          text: "Mostly strength. I liked the 7 AM group.",
          time: "4:14 PM",
        },
        {
          from: "agent",
          text: "Perfect. I can hold a spot in Strength Foundations this Tuesday at 10:30 AM. Does that work?",
          time: "4:15 PM",
        },
        {
          from: "member",
          text: "Tuesday works. See you then.",
          time: "4:17 PM",
        },
        {
          from: "agent",
          text: "Booked — Strength Foundations, Tue Nov 10 at 10:30 AM. I'll send a reminder on Monday. See you then, Dana.",
          time: "4:17 PM",
        },
      ],
      booking: {
        className: "Strength Foundations",
        when: "Tue, Nov 10 · 10:30 AM",
        value: 149,
      },
    },
    {
      id: "conv-marcus",
      leadId: "marcus",
      name: "Marcus Bell",
      phone: "(251) 555-0177",
      status: "awaiting",
      updated: "1h",
      messages: [
        {
          from: "campaign",
          text: campaignMessage("Marcus Bell", STUDIOS[0]),
          time: "Mon 4:02 PM",
        },
      ],
      booking: null,
    },
  ],
  bay: [],
};

export const seedBookings = {
  gcs: [
    {
      id: "book-dana",
      member: "Dana Whitfield",
      className: "Strength Foundations",
      when: "Tue, Nov 10 · 10:30 AM",
      value: 149,
      source: "AI agent",
      leadId: "dana",
    },
    {
      id: "book-chloe",
      member: "Chloe Reyes",
      className: "Reformer Pilates",
      when: "Wed, Nov 11 · 6:00 PM",
      value: 179,
      source: "AI agent",
      leadId: null,
    },
    {
      id: "book-derrick",
      member: "Derrick Shaw",
      className: "Open Gym Intro",
      when: "Thu, Nov 12 · 12:15 PM",
      value: 129,
      source: "Front desk",
      leadId: null,
    },
  ],
  bay: [],
};

export const seedActivity = {
  gcs: [
    {
      id: "act-1",
      kind: "booking",
      text: "AI agent booked Dana Whitfield into Strength Foundations",
      time: "12m ago",
    },
    {
      id: "act-2",
      kind: "reply",
      text: "Dana Whitfield replied YES to the win-back campaign",
      time: "18m ago",
    },
    {
      id: "act-3",
      kind: "sent",
      text: "Campaign sent to Dana Whitfield and Marcus Bell",
      time: "1h ago",
    },
    {
      id: "act-4",
      kind: "import",
      text: "8 former members imported from the studio CRM",
      time: "2h ago",
    },
  ],
  bay: [
    {
      id: "act-b1",
      kind: "import",
      text: "4 former members imported from the studio CRM",
      time: "Yesterday",
    },
  ],
};

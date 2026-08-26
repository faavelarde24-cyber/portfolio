export type Profile = {
  name: string;
  role: string;
  company: string;
  companyNote: string;
  location: string;
  intro: string;
  education: { degree: string; school: string; detail: string };
  photo: { src: string; alt: string };
};

export const profile: Profile = {
  name: 'Franz Alexander Velarde',
  role: 'Software Developer',
  company: 'LUCBITZ',
  companyNote: 'a Converge ICT franchise',
  location: 'Lucena City, Quezon, Philippines',
  intro:
    'I build web and mobile systems that businesses use every day — point-of-sale, inventory and reporting for internet service, retail, government and education organizations. Based in Lucena City, Quezon.',
  education: {
    degree: 'BS Computer Engineering',
    school: 'Batangas State University – Alangilan',
    detail: 'Cumulative GWA 1.92 · August 2024',
  },
  photo: {
    src: '/franz.jpg',
    alt: 'Franz Velarde, software developer at LUCBITZ in Lucena City',
  },
};

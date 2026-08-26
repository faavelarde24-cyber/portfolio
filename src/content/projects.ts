export type Project = {
  num: string;
  title: string;
  /** One line: what it is and what changed because of it. */
  summary: string;
  stack: string[];
  status: string;
};

export const projects: Project[] = [
  {
    num: '01',
    title: 'Company Inventory System',
    summary:
      'Company-wide inventory used by 7 staff roles at LUCBITZ, covering material requests, service reports and equipment tracking, with approval steps, email alerts and barcode scanning.',
    stack: ['PHP', 'MySQL', 'REST API', 'JavaScript'],
    status: 'In production',
  },
  {
    num: '02',
    title: 'BePure Water Station POS',
    summary:
      'Point-of-sale and inventory for a water refilling station: sales, stock across multiple storage locations, customer accounts, installments and refunds, and 14 exportable business reports.',
    stack: ['React', 'JavaScript', 'PHP', 'MySQL'],
    status: 'In daily use',
  },
  {
    num: '03',
    title: '911 Lucena Emergency App',
    summary:
      'Emergency response app for the Lucena City CDRRMO, letting residents request help, share live location and communicate securely with responders.',
    stack: ['Flutter', 'Dart', 'Firebase'],
    status: 'Shipped',
  },
];

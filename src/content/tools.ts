export type ToolGroup = { label: string; items: string[] };

export const tools: ToolGroup[] = [
  {
    label: 'Languages',
    items: ['JavaScript', 'PHP', 'Dart', 'Python', 'Java', 'C#', 'Kotlin', 'SQL', 'HTML5', 'CSS3'],
  },
  {
    label: 'Frameworks',
    items: ['React', 'Flutter', 'Laravel', 'ASP.NET MVC', 'Tailwind CSS', 'Bootstrap', 'Chart.js'],
  },
  {
    label: 'Data',
    items: ['MySQL', 'Firebase', 'Firestore', 'Supabase', 'REST APIs'],
  },
  {
    label: 'Practice',
    items: ['Database design', 'Access & security', 'Reporting & dashboards', 'Git', 'GitHub'],
  },
];

/**
 * The hero keycaps. `label` is the accessible name (and the hover readout);
 * `src` is a logo in `public/logos/`, drawn onto the cap face. Eighteen entries
 * fill the 6 x 3 grid — see README before changing the count.
 */
export type Keycap = { label: string; src: string };

export const keycaps: Keycap[] = [
  { label: 'JavaScript', src: '/logos/js.png' },
  { label: 'PHP', src: '/logos/php.png' },
  { label: 'React', src: '/logos/react.jpg' },
  { label: 'Flutter', src: '/logos/flutter.jpg' },
  { label: 'Dart', src: '/logos/dart.png' },
  { label: 'MySQL', src: '/logos/mysql.png' },
  { label: 'Laravel', src: '/logos/laravel.png' },
  { label: 'Tailwind CSS', src: '/logos/tailwind.png' },
  { label: 'Firebase', src: '/logos/firebase.png' },
  { label: 'REST APIs', src: '/logos/rest.jpg' },
  { label: 'Node', src: '/logos/node.png' },
  { label: 'Git', src: '/logos/git.png' },
  { label: 'HTML5', src: '/logos/html.png' },
  { label: 'CSS3', src: '/logos/css.png' },
  { label: 'C#', src: '/logos/csharp.png' },
  { label: 'Java', src: '/logos/java.png' },
  { label: 'Python', src: '/logos/python.jpg' },
  { label: 'Kotlin', src: '/logos/kotlin.png' },
];

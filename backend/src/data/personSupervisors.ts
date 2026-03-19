export const personSupervisors = [
  { subordinateId: 3, supervisorId: 1 }, // Jari → supervisor Matti
  { subordinateId: 8, supervisorId: 1 }, // Yuki → supervisor Matti
  { subordinateId: 17, supervisorId: 1 }, // Omar → supervisor Matti
  { subordinateId: 5, supervisorId: 2 }, // Mikko → supervisor Laura
  { subordinateId: 10, supervisorId: 2 }, // Fatima → supervisor Laura
  { subordinateId: 13, supervisorId: 2 }, // Sofia → supervisor Laura
  { subordinateId: 16, supervisorId: 2 }, // Giulia → supervisor Laura
  { subordinateId: 11, supervisorId: 4 }, // Wei → supervisor Sanna
  { subordinateId: 15, supervisorId: 4 }, // Elena → supervisor Sanna
  { subordinateId: 19, supervisorId: 4 }, // Chen → supervisor Sanna
  { subordinateId: 9, supervisorId: 6 }, // Lars → supervisor Päivi
  { subordinateId: 14, supervisorId: 6 }, // Ahmed → supervisor Päivi
  { subordinateId: 18, supervisorId: 6 }, // Anna → supervisor Päivi

  // Multiple supervisors
  { subordinateId: 7, supervisorId: 1 }, // Robert → supervisor Matti
  { subordinateId: 7, supervisorId: 4 }, // Robert → also supervisor Sanna
  { subordinateId: 12, supervisorId: 2 }, // Priya → supervisor Laura
  { subordinateId: 12, supervisorId: 6 }, // Priya → also supervisor Päivi
  { subordinateId: 20, supervisorId: 2 }, // Maria → supervisor Laura
  { subordinateId: 20, supervisorId: 4 }, // Maria → also supervisor Sanna
];

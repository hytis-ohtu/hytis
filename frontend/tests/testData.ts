export const rooms = [
  {
    id: 1,
    name: "A210",
    area: "63.60",
    capacity: 15,
    contracts: [
      {
        startDate: "2023-01-01",
        endDate: "2025-12-31",
        person: {
          firstName: "Matti",
          lastName: "Virtanen",
          department: {
            name: "Matematiikka ja tilastotiede",
          },
          title: {
            name: "asiantuntija",
          },
        },
      },
      {
        startDate: "2023-06-01",
        endDate: "2026-05-31",
        person: {
          firstName: "Laura",
          lastName: "Korhonen",
          department: {
            name: "Tietojenkäsittelytiede",
          },
          title: {
            name: "harjoittelija",
          },
        },
      },
      {
        startDate: "2024-01-01",
        endDate: "2026-12-31",
        person: {
          firstName: "Jari",
          lastName: "Nieminen",
          department: {
            name: "Matematiikka ja tilastotiede",
          },
          title: {
            name: "lehtori",
          },
        },
      },
    ],
  },
];

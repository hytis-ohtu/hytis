export const rooms = [
  {
    id: 1,
    name: "A210",
    area: "63.60",
    capacity: 15,
    freeText: "Hätäpoistumistie",
    roomType: "Konferenssihuone",
    department: {
      id: 2,
      name: "H523 CS",
    },
    contracts: [
      {
        startDate: "2023-01-01",
        endDate: "2025-12-31",
        person: {
          id: 1,
          firstName: "Matti",
          lastName: "Virtanen",
          department: {
            id: 1,
            name: "H516 MATHSTAT",
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
          id: 2,
          firstName: "Laura",
          lastName: "Korhonen",
          department: {
            id: 2,
            name: "H523 CS",
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
          id: 3,
          firstName: "Jari",
          lastName: "Nieminen",
          department: {
            id: 1,
            name: "H516 MATHSTAT",
          },
          title: {
            name: "lehtori",
          },
        },
      },
    ],
  },
  {
    id: 2,
    name: "A211",
    area: "14.60",
    capacity: 3,
    freeText: "",
    roomType: "",
    department: {
      id: 1,
      name: "H516 MATHSTAT",
    },
    contracts: [
      {
        startDate: "2022-09-01",
        endDate: "2025-08-31",
        person: {
          id: 4,
          firstName: "Sanna",
          lastName: "Mäkinen",
          department: {
            id: 2,
            name: "H523 CS",
          },
          title: {
            name: "professori",
          },
        },
      },
      {
        startDate: "2023-03-01",
        endDate: "2026-02-28",
        person: {
          id: 5,
          firstName: "Mikko",
          lastName: "Laine",
          department: {
            id: 1,
            name: "H516 MATHSTAT",
          },
          title: {
            name: "yliopistotutkija",
          },
        },
      },
    ],
  },
  {
    id: 3,
    name: "A212",
    area: "9.70",
    capacity: 2,
    freeText: "",
    roomType: "",
    department: {
      id: 1,
      name: "H516 MATHSTAT",
    },
    contracts: [
      {
        startDate: "2024-01-15",
        endDate: "2025-12-31",
        person: {
          id: 6,
          firstName: "Päivi",
          lastName: "Koskinen",
          department: {
            id: 2,
            name: "H523 CS",
          },
          title: {
            name: "asiantuntija",
          },
        },
      },
      {
        startDate: "2023-09-01",
        endDate: "2025-08-31",
        person: {
          id: 7,
          firstName: "Robert",
          lastName: "Miller",
          department: {
            id: 1,
            name: "H516 MATHSTAT",
          },
          title: {
            name: "harjoittelija",
          },
        },
      },
    ],
  },
];

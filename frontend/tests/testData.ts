export const rooms = [
  {
    id: 1,
    name: "A210",
    area: "63.60",
    capacity: 15,
    freeText: "Hätäpoistumistie",
    roomTypeId: 1,
    roomType: { id: 1, name: "konferenssihuone" },
    department: {
      id: 2,
      name: "H523 CS",
    },
    contracts: [
      {
        id: 1,
        startDate: "2023-01-01",
        endDate: "2025-12-31",
        person: {
          id: 1,
          firstName: "Matti",
          lastName: "Virtanen",
          freeText: null,
          department: {
            id: 1,
            name: "H516 MATHSTAT",
          },
          title: {
            id: 1,
            name: "asiantuntija",
          },
          researchGroup: {
            id: 1,
            name: "Algebrallisten rakenteiden tutkimusryhmä",
          },
        },
      },
      {
        id: 2,
        startDate: "2023-06-01",
        endDate: "2026-05-31",
        person: {
          id: 2,
          firstName: "Laura",
          lastName: "Korhonen",
          freeText: null,
          department: {
            id: 2,
            name: "H523 CS",
          },
          title: {
            id: 2,
            name: "harjoittelija",
          },
          researchGroup: {
            id: 2,
            name: "Ohjelmistotekniikan tutkimusryhmä",
          },
        },
      },
      {
        id: 3,
        startDate: "2024-01-01",
        endDate: "2026-12-31",
        person: {
          id: 3,
          firstName: "Jari",
          lastName: "Nieminen",
          freeText: null,
          department: {
            id: 1,
            name: "H516 MATHSTAT",
          },
          title: {
            id: 3,
            name: "lehtori",
          },
          researchGroup: {
            id: 1,
            name: "Algebrallisten rakenteiden tutkimusryhmä",
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
        id: 4,
        startDate: "2022-09-01",
        endDate: "2025-08-31",
        person: {
          id: 4,
          firstName: "Sanna",
          lastName: "Mäkinen",
          freeText: null,
          department: {
            id: 2,
            name: "H523 CS",
          },
          title: {
            id: 4,
            name: "professori",
          },
          researchGroup: {
            id: 2,
            name: "Ohjelmistotekniikan tutkimusryhmä",
          },
        },
      },
      {
        id: 5,
        startDate: "2023-03-01",
        endDate: "2026-02-28",
        person: {
          id: 5,
          firstName: "Mikko",
          lastName: "Laine",
          freeText: null,
          department: {
            id: 1,
            name: "H516 MATHSTAT",
          },
          title: {
            id: 5,
            name: "yliopistotutkija",
          },
          researchGroup: {
            id: 1,
            name: "Algebrallisten rakenteiden tutkimusryhmä",
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
        id: 6,
        startDate: "2024-01-15",
        endDate: "2025-12-31",
        person: {
          id: 6,
          firstName: "Päivi",
          lastName: "Koskinen",
          freeText: null,
          department: {
            id: 2,
            name: "H523 CS",
          },
          title: {
            id: 6,
            name: "asiantuntija",
          },
          researchGroup: {
            id: 2,
            name: "Ohjelmistotekniikan tutkimusryhmä",
          },
        },
      },
      {
        id: 7,
        startDate: "2023-09-01",
        endDate: "2025-08-31",
        person: {
          id: 7,
          firstName: "Robert",
          lastName: "Miller",
          freeText: null,
          department: {
            id: 1,
            name: "H516 MATHSTAT",
          },
          title: {
            id: 7,
            name: "harjoittelija",
          },
          researchGroup: {
            id: 1,
            name: "Algebrallisten rakenteiden tutkimusryhmä",
          },
        },
      },
    ],
  },
];

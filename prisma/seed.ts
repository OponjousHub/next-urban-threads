await prisma.tenant.create({
  data: {
    name: "Urban Threads",
    slug: "urban-threads",
    isDefault: true,
  },
});

import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Clearing old data...");
  await prisma.paymentOfferDetail.deleteMany();
  await prisma.paymentProductDetail.deleteMany();
  await prisma.paymentOffer.deleteMany();
  await prisma.paymentProduct.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.day.deleteMany();

  console.log("👤 Seeding admin user...");
  await prisma.user.create({
    data: {
      userName: "admin",
      password: "admin123",
      role: "admin",
    },
  });

  console.log("👤 Seeding delivery users...");
  const deliveryGuys = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.user.create({
        data: {
          userName: `livreur${i + 1}`,
          password: "password",
          role: "livreur",
          phoneNumber: faker.phone.number(),
        },
      })
    )
  );

  console.log("📅 Creating multiple days...");
  const days = await Promise.all(
    Array.from({ length: 100 }).map(() =>
      prisma.day.create({
        data: {
          startAt: faker.date.between({ from: "2025-01-01T00:00:00.000Z", to: new Date() }),
        },
      })
    )
  );

  console.log("📂 Creating categories...");
  const categories = await prisma.$transaction([
    prisma.category.create({
      data: {
        name: "Burgers",
        position: 1,
        imageUri: faker.image.url(),
      },
    }),
    prisma.category.create({
      data: {
        name: "Pizzas",
        position: 2,
        imageUri: faker.image.url(),
      },
    }),
  ]);

  console.log("🍔 Seeding products...");
  const productsData = Array.from({ length: 10 }).map((_, i) => ({
    name: faker.commerce.productName(),
    price: faker.number.int({ min: 5, max: 15 }), // integers only
    position: i + 1,
    isPublish: true,
    categoryId: faker.helpers.arrayElement(categories).id,
  }));

  await prisma.product.createMany({ data: productsData });
  const allProducts = await prisma.product.findMany();

  console.log("🎁 Seeding offers...");
  const offer1 = await prisma.offer.create({
    data: {
      name: "Family Feast",
      price: 23,
      isPublish: true,
      imageUri: faker.image.url(),
      products: {
        connect: [allProducts[0], allProducts[1]],
      },
    },
  });

  const offer2 = await prisma.offer.create({
    data: {
      name: "Double Trouble",
      price: 18,
      isPublish: true,
      imageUri: faker.image.url(),
      products: {
        connect: [allProducts[2], allProducts[3]],
      },
    },
  });

  const offer3 = await prisma.offer.create({
    data: {
      name: "Late Night Deal",
      price: 13,
      isPublish: true,
      imageUri: faker.image.url(),
      products: {
        connect: [allProducts[4], allProducts[5]],
      },
    },
  });

  const offers = [offer1, offer2, offer3];

  console.log("💳 Seeding 1500 mixed payments...");

  for (let i = 0; i < 1500; i++) {
    const useOffer = faker.datatype.boolean();
    const randomDay = faker.helpers.arrayElement(days);
    const withDelivery = faker.datatype.boolean();
    const deliveryGuy = faker.helpers.arrayElement(deliveryGuys);

    if (useOffer) {
      const selectedOffer = faker.helpers.arrayElement(offers);
      const quantity = faker.number.int({ min: 1, max: 3 });
      const total = Math.round(quantity * selectedOffer.price);

      await prisma.paymentOffer.create({
        data: {
          dailyNumber: i + 1,
          totalePrice: total,
          isPayed: true,
          clientPhoneNumber: faker.phone.number(),
          dayId: randomDay.id,
          ...(withDelivery && {
            delevryPrice: 5,
            delevryId: deliveryGuy.id,
          }),
          offers: {
            connect: [{ id: selectedOffer.id }],
          },
          detailsOffer: {
            create: [
              {
                offerId: selectedOffer.id,
                quantity,
                totalePrice: total,
              },
            ],
          },
        },
      });
    } else {
      const selected = faker.helpers.arrayElements(allProducts, 2);
      const detail = selected.map((p) => {
        const quantity = faker.number.int({ min: 1, max: 3 });
        return {
          productId: p.id,
          quantity,
          totalePrice: Math.round(p.price * quantity),
        };
      });

      const total = detail.reduce((sum, item) => sum + item.totalePrice, 0);

      await prisma.paymentProduct.create({
        data: {
          dailyNumber: i + 1,
          totalePrice: total,
          isPayed: true,
          clientPhoneNumber: faker.phone.number(),
          dayId: randomDay.id,
          ...(withDelivery && {
            delevryPrice: 5,
            delevryId: deliveryGuy.id,
          }),
          products: {
            connect: selected.map((p) => ({ id: p.id })),
          },
          detailsProducts: {
            create: detail,
          },
        },
      });
    }
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

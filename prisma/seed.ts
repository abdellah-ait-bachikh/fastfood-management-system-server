import { PrismaClient, UserRole } from "@prisma/client";
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

  console.log("👤 Seeding users...");
  const admin = await prisma.user.create({
    data: {
      userName: "admin",
      password: "admin123",
      role: "admin",
    },
  });

  const deliveryGuy = await prisma.user.create({
    data: {
      userName: "livreur1",
      password: "password",
      role: "livreur",
      phoneNumber: faker.phone.number(),
    },
  });

  console.log("📅 Creating day...");
  const day = await prisma.day.create({
    data: {
      startAt: new Date(),
    },
  });

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
    price: parseFloat(faker.commerce.price({ min: 5, max: 15 })),
    position: i + 1,
    isPublish: true,
    categoryId: faker.helpers.arrayElement(categories).id,
  }));

  const products = await prisma.product.createMany({
    data: productsData,
  });

  const allProducts = await prisma.product.findMany();

  console.log("🎁 Seeding offers...");
  const offer1 = await prisma.offer.create({
    data: {
      name: "Family Feast",
      price: 22.99,
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
      price: 18.5,
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
      price: 12.75,
      isPublish: true,
      imageUri: faker.image.url(),
      products: {
        connect: [allProducts[4], allProducts[5]],
      },
    },
  });

  const offers = [offer1, offer2, offer3];

  console.log("💳 Seeding paymentProducts...");
  for (let i = 0; i < 10; i++) {
    const selected = faker.helpers.arrayElements(allProducts, 2);
    const detail = selected.map((p) => ({
      productId: p.id,
      quantity: faker.number.int({ min: 1, max: 3 }),
      totalePrice: 0, // will update below
    }));

    // Compute total (excluding delivery)
    const total = detail.reduce((sum, item) => {
      const product = allProducts.find((p) => p.id === item.productId)!;
      item.totalePrice = product.price * item.quantity;
      return sum + item.totalePrice;
    }, 0);

    const withDelivery = faker.datatype.boolean();

    await prisma.paymentProduct.create({
      data: {
        dailyNumber: i + 1,
        totalePrice: total,
        isPayed: true,
        clientPhoneNumber: faker.phone.number(),
        dayId: day.id,
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

  console.log("💳 Seeding paymentOffers...");
  for (let i = 0; i < 10; i++) {
    const selectedOffer = faker.helpers.arrayElement(offers);
    const quantity = faker.number.int({ min: 1, max: 3 });
    const total = quantity * selectedOffer.price;

    const withDelivery = faker.datatype.boolean();

    await prisma.paymentOffer.create({
      data: {
        dailyNumber: i + 1,
        totalePrice: total,
        isPayed: true,
        clientPhoneNumber: faker.phone.number(),
        dayId: day.id,
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

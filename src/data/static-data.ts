export interface SalesTransaction {
  id: string;
  date: string;
  region: string;
  category: string;
  product: string;
  units: number;
  revenue: number;
}

export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  revenueGrowth: number;
}

export interface MonthRevenue {
  month: number;
  year: number;
  monthLabel: string;
  revenue: number;
}

export interface RegionRevenue {
  region: string;
  revenue: number;
  orders: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  orders: number;
}

export interface ProductRevenue {
  product: string;
  category: string;
  revenue: number;
  units: number;
}

export interface TransactionPage {
  data: SalesTransaction[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SalesFilters {
  years: number[];
  regions: string[];
  categories: string[];
}

const REGIONS = ["Northeast", "Southeast", "Midwest", "Southwest", "West"];

const PRODUCTS_BY_CATEGORY: Record<string, { products: string[]; minRev: number; maxRev: number }> = {
  Electronics: { products: ["Laptop Pro", "Wireless Headphones", "Smart Watch", "4K Tablet"], minRev: 300, maxRev: 2500 },
  Clothing: { products: ["Premium Jacket", "Running Shoes", "Denim Jeans", "Winter Coat"], minRev: 80, maxRev: 450 },
  "Home & Garden": { products: ["Garden Tool Set", "Smart Home Hub", "Coffee Maker", "Air Purifier"], minRev: 100, maxRev: 600 },
  Sports: { products: ["Yoga Mat Set", "Fitness Tracker", "Bicycle Helmet", "Resistance Bands"], minRev: 40, maxRev: 350 },
  "Food & Beverage": { products: ["Organic Coffee Bundle", "Craft Spice Kit", "Protein Powder", "Green Tea Set"], minRev: 30, maxRev: 180 },
  Toys: { products: ["Building Block Set", "Remote Control Car", "Board Game Collection", "Art Supply Kit"], minRev: 25, maxRev: 250 },
};

function makeLcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function generateTransactions(): SalesTransaction[] {
  const rand = makeLcg(42);
  const categories = Object.keys(PRODUCTS_BY_CATEGORY);
  const txs: SalesTransaction[] = [];
  let id = 1;

  for (let year = 2022; year <= 2024; year++) {
    for (let month = 1; month <= 12; month++) {
      const rowsThisMonth = 13 + Math.floor(rand() * 5);
      for (let i = 0; i < rowsThisMonth; i++) {
        const category = categories[Math.floor(rand() * categories.length)];
        const catData = PRODUCTS_BY_CATEGORY[category];
        const product = catData.products[Math.floor(rand() * catData.products.length)];
        const region = REGIONS[Math.floor(rand() * REGIONS.length)];
        const units = 1 + Math.floor(rand() * 7);
        const unitPrice = catData.minRev + rand() * (catData.maxRev - catData.minRev);
        const revenue = Math.round(unitPrice * units * 100) / 100;
        const day = 1 + Math.floor(rand() * 28);
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        txs.push({
          id: `TX-${String(id++).padStart(5, "0")}`,
          date: dateStr,
          region,
          category,
          product,
          units,
          revenue,
        });
      }
    }
  }

  return txs;
}

export const ALL_TRANSACTIONS: SalesTransaction[] = generateTransactions();

export const SALES_FILTERS: SalesFilters = {
  years: [2022, 2023, 2024],
  regions: REGIONS,
  categories: Object.keys(PRODUCTS_BY_CATEGORY),
};

import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const users = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Manager' }
    ];

    const products = [
      { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics', stock: 25 },
      { id: 2, name: 'Smartphone', price: 699.99, category: 'Electronics', stock: 50 },
      { id: 3, name: 'Desk Chair', price: 199.99, category: 'Furniture', stock: 10 },
      { id: 4, name: 'Coffee Maker', price: 89.99, category: 'Appliances', stock: 15 }
    ];

    const dashboard = {
      totalUsers: users.length,
      totalProducts: products.length,
      totalRevenue: 25000,
      monthlyGrowth: 12.5
    };

    return { users, products, dashboard };
  }

  genId(collection: any[]): number {
    return collection.length > 0 ? Math.max(...collection.map(item => item.id)) + 1 : 1;
  }
}
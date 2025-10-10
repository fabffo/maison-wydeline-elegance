import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SalesByProduct {
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

interface SalesBySize {
  size: number;
  total_quantity: number;
}

interface StockValue {
  product_name: string;
  total_stock: number;
  stock_value: number;
}

interface LowStock {
  product_name: string;
  size: number;
  stock_quantity: number;
  alert_threshold: number;
}

const COLORS = ['#3d3127', '#8b7355', '#c9b5a0', '#d4c4b5', '#e5ddd5'];

export const Reports = () => {
  const [salesByProduct, setSalesByProduct] = useState<SalesByProduct[]>([]);
  const [salesBySize, setSalesBySize] = useState<SalesBySize[]>([]);
  const [stockValue, setStockValue] = useState<StockValue[]>([]);
  const [lowStock, setLowStock] = useState<LowStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Sales by product
      const { data: salesData } = await supabase
        .from('order_items')
        .select('product_name, quantity, total_price');

      if (salesData) {
        const productSales = salesData.reduce((acc: any, item) => {
          if (!acc[item.product_name]) {
            acc[item.product_name] = { product_name: item.product_name, total_quantity: 0, total_revenue: 0 };
          }
          acc[item.product_name].total_quantity += item.quantity;
          acc[item.product_name].total_revenue += Number(item.total_price);
          return acc;
        }, {});
        setSalesByProduct(Object.values(productSales));
      }

      // Sales by size
      const { data: sizeSales } = await supabase
        .from('order_items')
        .select('size, quantity');

      if (sizeSales) {
        const sizeData = sizeSales.reduce((acc: Record<number, SalesBySize>, item) => {
          if (!acc[item.size]) {
            acc[item.size] = { size: item.size, total_quantity: 0 };
          }
          acc[item.size].total_quantity += item.quantity;
          return acc;
        }, {} as Record<number, SalesBySize>);
        setSalesBySize(Object.values(sizeData).sort((a, b) => a.size - b.size));
      }

      // Stock value
      const { data: variants } = await supabase
        .from('product_variants')
        .select('product_id, stock_quantity, products(name, price)');

      if (variants) {
        const stockData = variants.reduce((acc: any, variant: any) => {
          const productName = variant.products?.name || 'Unknown';
          const price = Number(variant.products?.price || 0);
          
          if (!acc[productName]) {
            acc[productName] = { product_name: productName, total_stock: 0, stock_value: 0 };
          }
          acc[productName].total_stock += variant.stock_quantity;
          acc[productName].stock_value += variant.stock_quantity * price;
          return acc;
        }, {});
        setStockValue(Object.values(stockData));
      }

      // Low stock alerts
      const { data: lowStockData } = await supabase
        .from('product_variants')
        .select('product_id, size, stock_quantity, alert_threshold, products(name)')
        .lt('stock_quantity', 5);

      if (lowStockData) {
        setLowStock(lowStockData.map((item: any) => ({
          product_name: item.products?.name || 'Unknown',
          size: item.size,
          stock_quantity: item.stock_quantity,
          alert_threshold: item.alert_threshold
        })));
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement des rapports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Rapports & Analyses</h1>
          <p className="text-muted-foreground">Statistiques de ventes, stocks et performances</p>
        </div>
      </div>

      {/* Sales by Product */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <CardTitle>Ventes par Produit</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(salesByProduct, 'ventes-produits')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByProduct}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product_name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_quantity" fill="#3d3127" name="Quantité vendue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Size */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ventes par Pointure</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(salesBySize, 'ventes-pointures')}
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={salesBySize}
                  dataKey="total_quantity"
                  nameKey="size"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.size}`}
                >
                  {salesBySize.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <CardTitle>Valeur du Stock</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(stockValue, 'valeur-stock')}
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stockValue.slice(0, 5).map((item) => (
                <div key={item.product_name} className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium">{item.product_name}</span>
                  <div className="text-right">
                    <div className="font-bold">{item.stock_value.toFixed(2)} €</div>
                    <div className="text-xs text-muted-foreground">{item.total_stock} unités</div>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{stockValue.reduce((sum, item) => sum + item.stock_value, 0).toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>Alertes Stock Faible</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(lowStock, 'stock-faible')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {lowStock.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aucune alerte de stock faible</p>
          ) : (
            <div className="space-y-2">
              {lowStock.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded bg-destructive/5">
                  <div>
                    <span className="font-medium">{item.product_name}</span>
                    <span className="text-muted-foreground ml-2">Taille {item.size}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-destructive">{item.stock_quantity} unités</div>
                    <div className="text-xs text-muted-foreground">Seuil: {item.alert_threshold}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

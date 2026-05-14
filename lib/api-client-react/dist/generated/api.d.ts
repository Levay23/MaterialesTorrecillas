import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ActivityItem, AiConfig, AiConfigUpdate, AiMessage, AiReply, AuthResponse, Category, CategoryInput, Conversation, Customer, CustomerInput, CustomerUpdate, CustomersReport, DashboardSummary, GetSalesReportParams, HealthStatus, InventoryReport, KnowledgeInput, KnowledgeItem, KnowledgeUpdate, ListConversationsParams, ListCustomersParams, ListKnowledgeItemsParams, ListProductsParams, ListPurchasesParams, ListQuotesParams, ListSalesParams, ListSuppliersParams, LoginInput, Message, MessageInput, Product, ProductInput, ProductUpdate, Purchase, PurchaseInput, PurchaseUpdate, Quote, QuoteInput, QuoteUpdate, Sale, SaleInput, SaleUpdate, SalesChartPoint, SalesReport, StockAdjustment, Supplier, SupplierInput, SupplierUpdate, TopProduct, User, UserInput, UserUpdate, WhatsappQr, WhatsappStatus } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Login
 */
export declare const getLoginUrl: () => string;
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<void>;
/**
 * @summary Login
 */
export declare const useLogin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
/**
 * @summary Get current user
 */
export declare const getGetMeUrl: () => string;
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<unknown>;
/**
 * @summary Get current user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Logout
 */
export declare const getLogoutUrl: () => string;
export declare const logout: (options?: RequestInit) => Promise<void>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
 * @summary Logout
 */
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
/**
 * @summary Dashboard summary stats
 */
export declare const getGetDashboardSummaryUrl: () => string;
export declare const getDashboardSummary: (options?: RequestInit) => Promise<DashboardSummary>;
export declare const getGetDashboardSummaryQueryKey: () => readonly ["/api/dashboard/summary"];
export declare const getGetDashboardSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardSummary>>>;
export type GetDashboardSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Dashboard summary stats
 */
export declare function useGetDashboardSummary<TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Sales chart data (last 30 days)
 */
export declare const getGetSalesChartUrl: () => string;
export declare const getSalesChart: (options?: RequestInit) => Promise<SalesChartPoint[]>;
export declare const getGetSalesChartQueryKey: () => readonly ["/api/dashboard/sales-chart"];
export declare const getGetSalesChartQueryOptions: <TData = Awaited<ReturnType<typeof getSalesChart>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesChart>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSalesChart>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSalesChartQueryResult = NonNullable<Awaited<ReturnType<typeof getSalesChart>>>;
export type GetSalesChartQueryError = ErrorType<unknown>;
/**
 * @summary Sales chart data (last 30 days)
 */
export declare function useGetSalesChart<TData = Awaited<ReturnType<typeof getSalesChart>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesChart>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Recent activity feed
 */
export declare const getGetRecentActivityUrl: () => string;
export declare const getRecentActivity: (options?: RequestInit) => Promise<ActivityItem[]>;
export declare const getGetRecentActivityQueryKey: () => readonly ["/api/dashboard/recent-activity"];
export declare const getGetRecentActivityQueryOptions: <TData = Awaited<ReturnType<typeof getRecentActivity>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRecentActivityQueryResult = NonNullable<Awaited<ReturnType<typeof getRecentActivity>>>;
export type GetRecentActivityQueryError = ErrorType<unknown>;
/**
 * @summary Recent activity feed
 */
export declare function useGetRecentActivity<TData = Awaited<ReturnType<typeof getRecentActivity>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Top selling products
 */
export declare const getGetTopProductsUrl: () => string;
export declare const getTopProducts: (options?: RequestInit) => Promise<TopProduct[]>;
export declare const getGetTopProductsQueryKey: () => readonly ["/api/dashboard/top-products"];
export declare const getGetTopProductsQueryOptions: <TData = Awaited<ReturnType<typeof getTopProducts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTopProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTopProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTopProductsQueryResult = NonNullable<Awaited<ReturnType<typeof getTopProducts>>>;
export type GetTopProductsQueryError = ErrorType<unknown>;
/**
 * @summary Top selling products
 */
export declare function useGetTopProducts<TData = Awaited<ReturnType<typeof getTopProducts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTopProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Low stock alerts
 */
export declare const getGetLowStockAlertsUrl: () => string;
export declare const getLowStockAlerts: (options?: RequestInit) => Promise<Product[]>;
export declare const getGetLowStockAlertsQueryKey: () => readonly ["/api/dashboard/low-stock"];
export declare const getGetLowStockAlertsQueryOptions: <TData = Awaited<ReturnType<typeof getLowStockAlerts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLowStockAlerts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getLowStockAlerts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetLowStockAlertsQueryResult = NonNullable<Awaited<ReturnType<typeof getLowStockAlerts>>>;
export type GetLowStockAlertsQueryError = ErrorType<unknown>;
/**
 * @summary Low stock alerts
 */
export declare function useGetLowStockAlerts<TData = Awaited<ReturnType<typeof getLowStockAlerts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLowStockAlerts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List customers
 */
export declare const getListCustomersUrl: (params?: ListCustomersParams) => string;
export declare const listCustomers: (params?: ListCustomersParams, options?: RequestInit) => Promise<Customer[]>;
export declare const getListCustomersQueryKey: (params?: ListCustomersParams) => readonly ["/api/customers", ...ListCustomersParams[]];
export declare const getListCustomersQueryOptions: <TData = Awaited<ReturnType<typeof listCustomers>>, TError = ErrorType<unknown>>(params?: ListCustomersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCustomers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCustomers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCustomersQueryResult = NonNullable<Awaited<ReturnType<typeof listCustomers>>>;
export type ListCustomersQueryError = ErrorType<unknown>;
/**
 * @summary List customers
 */
export declare function useListCustomers<TData = Awaited<ReturnType<typeof listCustomers>>, TError = ErrorType<unknown>>(params?: ListCustomersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCustomers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create customer
 */
export declare const getCreateCustomerUrl: () => string;
export declare const createCustomer: (customerInput: CustomerInput, options?: RequestInit) => Promise<Customer>;
export declare const getCreateCustomerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCustomer>>, TError, {
        data: BodyType<CustomerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCustomer>>, TError, {
    data: BodyType<CustomerInput>;
}, TContext>;
export type CreateCustomerMutationResult = NonNullable<Awaited<ReturnType<typeof createCustomer>>>;
export type CreateCustomerMutationBody = BodyType<CustomerInput>;
export type CreateCustomerMutationError = ErrorType<unknown>;
/**
 * @summary Create customer
 */
export declare const useCreateCustomer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCustomer>>, TError, {
        data: BodyType<CustomerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCustomer>>, TError, {
    data: BodyType<CustomerInput>;
}, TContext>;
/**
 * @summary Get customer
 */
export declare const getGetCustomerUrl: (id: number) => string;
export declare const getCustomer: (id: number, options?: RequestInit) => Promise<Customer>;
export declare const getGetCustomerQueryKey: (id: number) => readonly [`/api/customers/${number}`];
export declare const getGetCustomerQueryOptions: <TData = Awaited<ReturnType<typeof getCustomer>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCustomer>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCustomer>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCustomerQueryResult = NonNullable<Awaited<ReturnType<typeof getCustomer>>>;
export type GetCustomerQueryError = ErrorType<unknown>;
/**
 * @summary Get customer
 */
export declare function useGetCustomer<TData = Awaited<ReturnType<typeof getCustomer>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCustomer>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update customer
 */
export declare const getUpdateCustomerUrl: (id: number) => string;
export declare const updateCustomer: (id: number, customerUpdate: CustomerUpdate, options?: RequestInit) => Promise<Customer>;
export declare const getUpdateCustomerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCustomer>>, TError, {
        id: number;
        data: BodyType<CustomerUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCustomer>>, TError, {
    id: number;
    data: BodyType<CustomerUpdate>;
}, TContext>;
export type UpdateCustomerMutationResult = NonNullable<Awaited<ReturnType<typeof updateCustomer>>>;
export type UpdateCustomerMutationBody = BodyType<CustomerUpdate>;
export type UpdateCustomerMutationError = ErrorType<unknown>;
/**
 * @summary Update customer
 */
export declare const useUpdateCustomer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCustomer>>, TError, {
        id: number;
        data: BodyType<CustomerUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCustomer>>, TError, {
    id: number;
    data: BodyType<CustomerUpdate>;
}, TContext>;
/**
 * @summary Delete customer
 */
export declare const getDeleteCustomerUrl: (id: number) => string;
export declare const deleteCustomer: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteCustomerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCustomer>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCustomer>>, TError, {
    id: number;
}, TContext>;
export type DeleteCustomerMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCustomer>>>;
export type DeleteCustomerMutationError = ErrorType<unknown>;
/**
 * @summary Delete customer
 */
export declare const useDeleteCustomer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCustomer>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCustomer>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Get customer purchase history
 */
export declare const getGetCustomerPurchasesUrl: (id: number) => string;
export declare const getCustomerPurchases: (id: number, options?: RequestInit) => Promise<Sale[]>;
export declare const getGetCustomerPurchasesQueryKey: (id: number) => readonly [`/api/customers/${number}/purchases`];
export declare const getGetCustomerPurchasesQueryOptions: <TData = Awaited<ReturnType<typeof getCustomerPurchases>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCustomerPurchases>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCustomerPurchases>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCustomerPurchasesQueryResult = NonNullable<Awaited<ReturnType<typeof getCustomerPurchases>>>;
export type GetCustomerPurchasesQueryError = ErrorType<unknown>;
/**
 * @summary Get customer purchase history
 */
export declare function useGetCustomerPurchases<TData = Awaited<ReturnType<typeof getCustomerPurchases>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCustomerPurchases>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List categories
 */
export declare const getListCategoriesUrl: () => string;
export declare const listCategories: (options?: RequestInit) => Promise<Category[]>;
export declare const getListCategoriesQueryKey: () => readonly ["/api/categories"];
export declare const getListCategoriesQueryOptions: <TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCategoriesQueryResult = NonNullable<Awaited<ReturnType<typeof listCategories>>>;
export type ListCategoriesQueryError = ErrorType<unknown>;
/**
 * @summary List categories
 */
export declare function useListCategories<TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create category
 */
export declare const getCreateCategoryUrl: () => string;
export declare const createCategory: (categoryInput: CategoryInput, options?: RequestInit) => Promise<Category>;
export declare const getCreateCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
        data: BodyType<CategoryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
    data: BodyType<CategoryInput>;
}, TContext>;
export type CreateCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof createCategory>>>;
export type CreateCategoryMutationBody = BodyType<CategoryInput>;
export type CreateCategoryMutationError = ErrorType<unknown>;
/**
 * @summary Create category
 */
export declare const useCreateCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
        data: BodyType<CategoryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCategory>>, TError, {
    data: BodyType<CategoryInput>;
}, TContext>;
/**
 * @summary List products
 */
export declare const getListProductsUrl: (params?: ListProductsParams) => string;
export declare const listProducts: (params?: ListProductsParams, options?: RequestInit) => Promise<Product[]>;
export declare const getListProductsQueryKey: (params?: ListProductsParams) => readonly ["/api/products", ...ListProductsParams[]];
export declare const getListProductsQueryOptions: <TData = Awaited<ReturnType<typeof listProducts>>, TError = ErrorType<unknown>>(params?: ListProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListProductsQueryResult = NonNullable<Awaited<ReturnType<typeof listProducts>>>;
export type ListProductsQueryError = ErrorType<unknown>;
/**
 * @summary List products
 */
export declare function useListProducts<TData = Awaited<ReturnType<typeof listProducts>>, TError = ErrorType<unknown>>(params?: ListProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create product
 */
export declare const getCreateProductUrl: () => string;
export declare const createProduct: (productInput: ProductInput, options?: RequestInit) => Promise<Product>;
export declare const getCreateProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
        data: BodyType<ProductInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
    data: BodyType<ProductInput>;
}, TContext>;
export type CreateProductMutationResult = NonNullable<Awaited<ReturnType<typeof createProduct>>>;
export type CreateProductMutationBody = BodyType<ProductInput>;
export type CreateProductMutationError = ErrorType<unknown>;
/**
 * @summary Create product
 */
export declare const useCreateProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
        data: BodyType<ProductInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createProduct>>, TError, {
    data: BodyType<ProductInput>;
}, TContext>;
/**
 * @summary Get product
 */
export declare const getGetProductUrl: (id: number) => string;
export declare const getProduct: (id: number, options?: RequestInit) => Promise<Product>;
export declare const getGetProductQueryKey: (id: number) => readonly [`/api/products/${number}`];
export declare const getGetProductQueryOptions: <TData = Awaited<ReturnType<typeof getProduct>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProductQueryResult = NonNullable<Awaited<ReturnType<typeof getProduct>>>;
export type GetProductQueryError = ErrorType<unknown>;
/**
 * @summary Get product
 */
export declare function useGetProduct<TData = Awaited<ReturnType<typeof getProduct>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update product
 */
export declare const getUpdateProductUrl: (id: number) => string;
export declare const updateProduct: (id: number, productUpdate: ProductUpdate, options?: RequestInit) => Promise<Product>;
export declare const getUpdateProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
        id: number;
        data: BodyType<ProductUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
    id: number;
    data: BodyType<ProductUpdate>;
}, TContext>;
export type UpdateProductMutationResult = NonNullable<Awaited<ReturnType<typeof updateProduct>>>;
export type UpdateProductMutationBody = BodyType<ProductUpdate>;
export type UpdateProductMutationError = ErrorType<unknown>;
/**
 * @summary Update product
 */
export declare const useUpdateProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
        id: number;
        data: BodyType<ProductUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProduct>>, TError, {
    id: number;
    data: BodyType<ProductUpdate>;
}, TContext>;
/**
 * @summary Delete product
 */
export declare const getDeleteProductUrl: (id: number) => string;
export declare const deleteProduct: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
    id: number;
}, TContext>;
export type DeleteProductMutationResult = NonNullable<Awaited<ReturnType<typeof deleteProduct>>>;
export type DeleteProductMutationError = ErrorType<unknown>;
/**
 * @summary Delete product
 */
export declare const useDeleteProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteProduct>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Adjust product stock
 */
export declare const getAdjustProductStockUrl: (id: number) => string;
export declare const adjustProductStock: (id: number, stockAdjustment: StockAdjustment, options?: RequestInit) => Promise<Product>;
export declare const getAdjustProductStockMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adjustProductStock>>, TError, {
        id: number;
        data: BodyType<StockAdjustment>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adjustProductStock>>, TError, {
    id: number;
    data: BodyType<StockAdjustment>;
}, TContext>;
export type AdjustProductStockMutationResult = NonNullable<Awaited<ReturnType<typeof adjustProductStock>>>;
export type AdjustProductStockMutationBody = BodyType<StockAdjustment>;
export type AdjustProductStockMutationError = ErrorType<unknown>;
/**
 * @summary Adjust product stock
 */
export declare const useAdjustProductStock: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adjustProductStock>>, TError, {
        id: number;
        data: BodyType<StockAdjustment>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adjustProductStock>>, TError, {
    id: number;
    data: BodyType<StockAdjustment>;
}, TContext>;
/**
 * @summary List sales
 */
export declare const getListSalesUrl: (params?: ListSalesParams) => string;
export declare const listSales: (params?: ListSalesParams, options?: RequestInit) => Promise<Sale[]>;
export declare const getListSalesQueryKey: (params?: ListSalesParams) => readonly ["/api/sales", ...ListSalesParams[]];
export declare const getListSalesQueryOptions: <TData = Awaited<ReturnType<typeof listSales>>, TError = ErrorType<unknown>>(params?: ListSalesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSales>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listSales>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListSalesQueryResult = NonNullable<Awaited<ReturnType<typeof listSales>>>;
export type ListSalesQueryError = ErrorType<unknown>;
/**
 * @summary List sales
 */
export declare function useListSales<TData = Awaited<ReturnType<typeof listSales>>, TError = ErrorType<unknown>>(params?: ListSalesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSales>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create sale
 */
export declare const getCreateSaleUrl: () => string;
export declare const createSale: (saleInput: SaleInput, options?: RequestInit) => Promise<Sale>;
export declare const getCreateSaleMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSale>>, TError, {
        data: BodyType<SaleInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createSale>>, TError, {
    data: BodyType<SaleInput>;
}, TContext>;
export type CreateSaleMutationResult = NonNullable<Awaited<ReturnType<typeof createSale>>>;
export type CreateSaleMutationBody = BodyType<SaleInput>;
export type CreateSaleMutationError = ErrorType<unknown>;
/**
 * @summary Create sale
 */
export declare const useCreateSale: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSale>>, TError, {
        data: BodyType<SaleInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createSale>>, TError, {
    data: BodyType<SaleInput>;
}, TContext>;
/**
 * @summary Get sale
 */
export declare const getGetSaleUrl: (id: number) => string;
export declare const getSale: (id: number, options?: RequestInit) => Promise<Sale>;
export declare const getGetSaleQueryKey: (id: number) => readonly [`/api/sales/${number}`];
export declare const getGetSaleQueryOptions: <TData = Awaited<ReturnType<typeof getSale>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSale>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSale>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSaleQueryResult = NonNullable<Awaited<ReturnType<typeof getSale>>>;
export type GetSaleQueryError = ErrorType<unknown>;
/**
 * @summary Get sale
 */
export declare function useGetSale<TData = Awaited<ReturnType<typeof getSale>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSale>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update sale status
 */
export declare const getUpdateSaleUrl: (id: number) => string;
export declare const updateSale: (id: number, saleUpdate: SaleUpdate, options?: RequestInit) => Promise<Sale>;
export declare const getUpdateSaleMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSale>>, TError, {
        id: number;
        data: BodyType<SaleUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateSale>>, TError, {
    id: number;
    data: BodyType<SaleUpdate>;
}, TContext>;
export type UpdateSaleMutationResult = NonNullable<Awaited<ReturnType<typeof updateSale>>>;
export type UpdateSaleMutationBody = BodyType<SaleUpdate>;
export type UpdateSaleMutationError = ErrorType<unknown>;
/**
 * @summary Update sale status
 */
export declare const useUpdateSale: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSale>>, TError, {
        id: number;
        data: BodyType<SaleUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateSale>>, TError, {
    id: number;
    data: BodyType<SaleUpdate>;
}, TContext>;
/**
 * @summary List quotes
 */
export declare const getListQuotesUrl: (params?: ListQuotesParams) => string;
export declare const listQuotes: (params?: ListQuotesParams, options?: RequestInit) => Promise<Quote[]>;
export declare const getListQuotesQueryKey: (params?: ListQuotesParams) => readonly ["/api/quotes", ...ListQuotesParams[]];
export declare const getListQuotesQueryOptions: <TData = Awaited<ReturnType<typeof listQuotes>>, TError = ErrorType<unknown>>(params?: ListQuotesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listQuotes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listQuotes>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListQuotesQueryResult = NonNullable<Awaited<ReturnType<typeof listQuotes>>>;
export type ListQuotesQueryError = ErrorType<unknown>;
/**
 * @summary List quotes
 */
export declare function useListQuotes<TData = Awaited<ReturnType<typeof listQuotes>>, TError = ErrorType<unknown>>(params?: ListQuotesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listQuotes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create quote
 */
export declare const getCreateQuoteUrl: () => string;
export declare const createQuote: (quoteInput: QuoteInput, options?: RequestInit) => Promise<Quote>;
export declare const getCreateQuoteMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createQuote>>, TError, {
        data: BodyType<QuoteInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createQuote>>, TError, {
    data: BodyType<QuoteInput>;
}, TContext>;
export type CreateQuoteMutationResult = NonNullable<Awaited<ReturnType<typeof createQuote>>>;
export type CreateQuoteMutationBody = BodyType<QuoteInput>;
export type CreateQuoteMutationError = ErrorType<unknown>;
/**
 * @summary Create quote
 */
export declare const useCreateQuote: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createQuote>>, TError, {
        data: BodyType<QuoteInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createQuote>>, TError, {
    data: BodyType<QuoteInput>;
}, TContext>;
/**
 * @summary Get quote
 */
export declare const getGetQuoteUrl: (id: number) => string;
export declare const getQuote: (id: number, options?: RequestInit) => Promise<Quote>;
export declare const getGetQuoteQueryKey: (id: number) => readonly [`/api/quotes/${number}`];
export declare const getGetQuoteQueryOptions: <TData = Awaited<ReturnType<typeof getQuote>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getQuote>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getQuote>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetQuoteQueryResult = NonNullable<Awaited<ReturnType<typeof getQuote>>>;
export type GetQuoteQueryError = ErrorType<unknown>;
/**
 * @summary Get quote
 */
export declare function useGetQuote<TData = Awaited<ReturnType<typeof getQuote>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getQuote>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update quote
 */
export declare const getUpdateQuoteUrl: (id: number) => string;
export declare const updateQuote: (id: number, quoteUpdate: QuoteUpdate, options?: RequestInit) => Promise<Quote>;
export declare const getUpdateQuoteMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateQuote>>, TError, {
        id: number;
        data: BodyType<QuoteUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateQuote>>, TError, {
    id: number;
    data: BodyType<QuoteUpdate>;
}, TContext>;
export type UpdateQuoteMutationResult = NonNullable<Awaited<ReturnType<typeof updateQuote>>>;
export type UpdateQuoteMutationBody = BodyType<QuoteUpdate>;
export type UpdateQuoteMutationError = ErrorType<unknown>;
/**
 * @summary Update quote
 */
export declare const useUpdateQuote: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateQuote>>, TError, {
        id: number;
        data: BodyType<QuoteUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateQuote>>, TError, {
    id: number;
    data: BodyType<QuoteUpdate>;
}, TContext>;
/**
 * @summary Convert quote to sale
 */
export declare const getConvertQuoteToSaleUrl: (id: number) => string;
export declare const convertQuoteToSale: (id: number, options?: RequestInit) => Promise<Sale>;
export declare const getConvertQuoteToSaleMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof convertQuoteToSale>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof convertQuoteToSale>>, TError, {
    id: number;
}, TContext>;
export type ConvertQuoteToSaleMutationResult = NonNullable<Awaited<ReturnType<typeof convertQuoteToSale>>>;
export type ConvertQuoteToSaleMutationError = ErrorType<unknown>;
/**
 * @summary Convert quote to sale
 */
export declare const useConvertQuoteToSale: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof convertQuoteToSale>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof convertQuoteToSale>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary List suppliers
 */
export declare const getListSuppliersUrl: (params?: ListSuppliersParams) => string;
export declare const listSuppliers: (params?: ListSuppliersParams, options?: RequestInit) => Promise<Supplier[]>;
export declare const getListSuppliersQueryKey: (params?: ListSuppliersParams) => readonly ["/api/suppliers", ...ListSuppliersParams[]];
export declare const getListSuppliersQueryOptions: <TData = Awaited<ReturnType<typeof listSuppliers>>, TError = ErrorType<unknown>>(params?: ListSuppliersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSuppliers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listSuppliers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListSuppliersQueryResult = NonNullable<Awaited<ReturnType<typeof listSuppliers>>>;
export type ListSuppliersQueryError = ErrorType<unknown>;
/**
 * @summary List suppliers
 */
export declare function useListSuppliers<TData = Awaited<ReturnType<typeof listSuppliers>>, TError = ErrorType<unknown>>(params?: ListSuppliersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSuppliers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create supplier
 */
export declare const getCreateSupplierUrl: () => string;
export declare const createSupplier: (supplierInput: SupplierInput, options?: RequestInit) => Promise<Supplier>;
export declare const getCreateSupplierMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSupplier>>, TError, {
        data: BodyType<SupplierInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createSupplier>>, TError, {
    data: BodyType<SupplierInput>;
}, TContext>;
export type CreateSupplierMutationResult = NonNullable<Awaited<ReturnType<typeof createSupplier>>>;
export type CreateSupplierMutationBody = BodyType<SupplierInput>;
export type CreateSupplierMutationError = ErrorType<unknown>;
/**
 * @summary Create supplier
 */
export declare const useCreateSupplier: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSupplier>>, TError, {
        data: BodyType<SupplierInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createSupplier>>, TError, {
    data: BodyType<SupplierInput>;
}, TContext>;
/**
 * @summary Get supplier
 */
export declare const getGetSupplierUrl: (id: number) => string;
export declare const getSupplier: (id: number, options?: RequestInit) => Promise<Supplier>;
export declare const getGetSupplierQueryKey: (id: number) => readonly [`/api/suppliers/${number}`];
export declare const getGetSupplierQueryOptions: <TData = Awaited<ReturnType<typeof getSupplier>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSupplier>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSupplier>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSupplierQueryResult = NonNullable<Awaited<ReturnType<typeof getSupplier>>>;
export type GetSupplierQueryError = ErrorType<unknown>;
/**
 * @summary Get supplier
 */
export declare function useGetSupplier<TData = Awaited<ReturnType<typeof getSupplier>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSupplier>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update supplier
 */
export declare const getUpdateSupplierUrl: (id: number) => string;
export declare const updateSupplier: (id: number, supplierUpdate: SupplierUpdate, options?: RequestInit) => Promise<Supplier>;
export declare const getUpdateSupplierMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSupplier>>, TError, {
        id: number;
        data: BodyType<SupplierUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateSupplier>>, TError, {
    id: number;
    data: BodyType<SupplierUpdate>;
}, TContext>;
export type UpdateSupplierMutationResult = NonNullable<Awaited<ReturnType<typeof updateSupplier>>>;
export type UpdateSupplierMutationBody = BodyType<SupplierUpdate>;
export type UpdateSupplierMutationError = ErrorType<unknown>;
/**
 * @summary Update supplier
 */
export declare const useUpdateSupplier: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSupplier>>, TError, {
        id: number;
        data: BodyType<SupplierUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateSupplier>>, TError, {
    id: number;
    data: BodyType<SupplierUpdate>;
}, TContext>;
/**
 * @summary Delete supplier
 */
export declare const getDeleteSupplierUrl: (id: number) => string;
export declare const deleteSupplier: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteSupplierMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteSupplier>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteSupplier>>, TError, {
    id: number;
}, TContext>;
export type DeleteSupplierMutationResult = NonNullable<Awaited<ReturnType<typeof deleteSupplier>>>;
export type DeleteSupplierMutationError = ErrorType<unknown>;
/**
 * @summary Delete supplier
 */
export declare const useDeleteSupplier: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteSupplier>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteSupplier>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary List purchase orders
 */
export declare const getListPurchasesUrl: (params?: ListPurchasesParams) => string;
export declare const listPurchases: (params?: ListPurchasesParams, options?: RequestInit) => Promise<Purchase[]>;
export declare const getListPurchasesQueryKey: (params?: ListPurchasesParams) => readonly ["/api/purchases", ...ListPurchasesParams[]];
export declare const getListPurchasesQueryOptions: <TData = Awaited<ReturnType<typeof listPurchases>>, TError = ErrorType<unknown>>(params?: ListPurchasesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPurchases>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPurchases>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPurchasesQueryResult = NonNullable<Awaited<ReturnType<typeof listPurchases>>>;
export type ListPurchasesQueryError = ErrorType<unknown>;
/**
 * @summary List purchase orders
 */
export declare function useListPurchases<TData = Awaited<ReturnType<typeof listPurchases>>, TError = ErrorType<unknown>>(params?: ListPurchasesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPurchases>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create purchase order
 */
export declare const getCreatePurchaseUrl: () => string;
export declare const createPurchase: (purchaseInput: PurchaseInput, options?: RequestInit) => Promise<Purchase>;
export declare const getCreatePurchaseMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPurchase>>, TError, {
        data: BodyType<PurchaseInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPurchase>>, TError, {
    data: BodyType<PurchaseInput>;
}, TContext>;
export type CreatePurchaseMutationResult = NonNullable<Awaited<ReturnType<typeof createPurchase>>>;
export type CreatePurchaseMutationBody = BodyType<PurchaseInput>;
export type CreatePurchaseMutationError = ErrorType<unknown>;
/**
 * @summary Create purchase order
 */
export declare const useCreatePurchase: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPurchase>>, TError, {
        data: BodyType<PurchaseInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createPurchase>>, TError, {
    data: BodyType<PurchaseInput>;
}, TContext>;
/**
 * @summary Get purchase order
 */
export declare const getGetPurchaseUrl: (id: number) => string;
export declare const getPurchase: (id: number, options?: RequestInit) => Promise<Purchase>;
export declare const getGetPurchaseQueryKey: (id: number) => readonly [`/api/purchases/${number}`];
export declare const getGetPurchaseQueryOptions: <TData = Awaited<ReturnType<typeof getPurchase>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPurchase>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPurchase>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPurchaseQueryResult = NonNullable<Awaited<ReturnType<typeof getPurchase>>>;
export type GetPurchaseQueryError = ErrorType<unknown>;
/**
 * @summary Get purchase order
 */
export declare function useGetPurchase<TData = Awaited<ReturnType<typeof getPurchase>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPurchase>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update purchase order
 */
export declare const getUpdatePurchaseUrl: (id: number) => string;
export declare const updatePurchase: (id: number, purchaseUpdate: PurchaseUpdate, options?: RequestInit) => Promise<Purchase>;
export declare const getUpdatePurchaseMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePurchase>>, TError, {
        id: number;
        data: BodyType<PurchaseUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePurchase>>, TError, {
    id: number;
    data: BodyType<PurchaseUpdate>;
}, TContext>;
export type UpdatePurchaseMutationResult = NonNullable<Awaited<ReturnType<typeof updatePurchase>>>;
export type UpdatePurchaseMutationBody = BodyType<PurchaseUpdate>;
export type UpdatePurchaseMutationError = ErrorType<unknown>;
/**
 * @summary Update purchase order
 */
export declare const useUpdatePurchase: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePurchase>>, TError, {
        id: number;
        data: BodyType<PurchaseUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updatePurchase>>, TError, {
    id: number;
    data: BodyType<PurchaseUpdate>;
}, TContext>;
/**
 * @summary WhatsApp connection status
 */
export declare const getGetWhatsappStatusUrl: () => string;
export declare const getWhatsappStatus: (options?: RequestInit) => Promise<WhatsappStatus>;
export declare const getGetWhatsappStatusQueryKey: () => readonly ["/api/whatsapp/status"];
export declare const getGetWhatsappStatusQueryOptions: <TData = Awaited<ReturnType<typeof getWhatsappStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWhatsappStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWhatsappStatus>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWhatsappStatusQueryResult = NonNullable<Awaited<ReturnType<typeof getWhatsappStatus>>>;
export type GetWhatsappStatusQueryError = ErrorType<unknown>;
/**
 * @summary WhatsApp connection status
 */
export declare function useGetWhatsappStatus<TData = Awaited<ReturnType<typeof getWhatsappStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWhatsappStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get QR code for WhatsApp
 */
export declare const getGetWhatsappQrUrl: () => string;
export declare const getWhatsappQr: (options?: RequestInit) => Promise<WhatsappQr>;
export declare const getGetWhatsappQrQueryKey: () => readonly ["/api/whatsapp/qr"];
export declare const getGetWhatsappQrQueryOptions: <TData = Awaited<ReturnType<typeof getWhatsappQr>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWhatsappQr>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWhatsappQr>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWhatsappQrQueryResult = NonNullable<Awaited<ReturnType<typeof getWhatsappQr>>>;
export type GetWhatsappQrQueryError = ErrorType<unknown>;
/**
 * @summary Get QR code for WhatsApp
 */
export declare function useGetWhatsappQr<TData = Awaited<ReturnType<typeof getWhatsappQr>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWhatsappQr>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Disconnect WhatsApp
 */
export declare const getDisconnectWhatsappUrl: () => string;
export declare const disconnectWhatsapp: (options?: RequestInit) => Promise<void>;
export declare const getDisconnectWhatsappMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof disconnectWhatsapp>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof disconnectWhatsapp>>, TError, void, TContext>;
export type DisconnectWhatsappMutationResult = NonNullable<Awaited<ReturnType<typeof disconnectWhatsapp>>>;
export type DisconnectWhatsappMutationError = ErrorType<unknown>;
/**
 * @summary Disconnect WhatsApp
 */
export declare const useDisconnectWhatsapp: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof disconnectWhatsapp>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof disconnectWhatsapp>>, TError, void, TContext>;
/**
 * @summary List WhatsApp conversations
 */
export declare const getListConversationsUrl: (params?: ListConversationsParams) => string;
export declare const listConversations: (params?: ListConversationsParams, options?: RequestInit) => Promise<Conversation[]>;
export declare const getListConversationsQueryKey: (params?: ListConversationsParams) => readonly ["/api/whatsapp/conversations", ...ListConversationsParams[]];
export declare const getListConversationsQueryOptions: <TData = Awaited<ReturnType<typeof listConversations>>, TError = ErrorType<unknown>>(params?: ListConversationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listConversations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listConversations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListConversationsQueryResult = NonNullable<Awaited<ReturnType<typeof listConversations>>>;
export type ListConversationsQueryError = ErrorType<unknown>;
/**
 * @summary List WhatsApp conversations
 */
export declare function useListConversations<TData = Awaited<ReturnType<typeof listConversations>>, TError = ErrorType<unknown>>(params?: ListConversationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listConversations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get conversation messages
 */
export declare const getGetConversationMessagesUrl: (id: number) => string;
export declare const getConversationMessages: (id: number, options?: RequestInit) => Promise<Message[]>;
export declare const getGetConversationMessagesQueryKey: (id: number) => readonly [`/api/whatsapp/conversations/${number}/messages`];
export declare const getGetConversationMessagesQueryOptions: <TData = Awaited<ReturnType<typeof getConversationMessages>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getConversationMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getConversationMessages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetConversationMessagesQueryResult = NonNullable<Awaited<ReturnType<typeof getConversationMessages>>>;
export type GetConversationMessagesQueryError = ErrorType<unknown>;
/**
 * @summary Get conversation messages
 */
export declare function useGetConversationMessages<TData = Awaited<ReturnType<typeof getConversationMessages>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getConversationMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Send message
 */
export declare const getSendMessageUrl: (id: number) => string;
export declare const sendMessage: (id: number, messageInput: MessageInput, options?: RequestInit) => Promise<Message>;
export declare const getSendMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        id: number;
        data: BodyType<MessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
    id: number;
    data: BodyType<MessageInput>;
}, TContext>;
export type SendMessageMutationResult = NonNullable<Awaited<ReturnType<typeof sendMessage>>>;
export type SendMessageMutationBody = BodyType<MessageInput>;
export type SendMessageMutationError = ErrorType<unknown>;
/**
 * @summary Send message
 */
export declare const useSendMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        id: number;
        data: BodyType<MessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendMessage>>, TError, {
    id: number;
    data: BodyType<MessageInput>;
}, TContext>;
/**
 * @summary Get AI configuration
 */
export declare const getGetAiConfigUrl: () => string;
export declare const getAiConfig: (options?: RequestInit) => Promise<AiConfig>;
export declare const getGetAiConfigQueryKey: () => readonly ["/api/ai/config"];
export declare const getGetAiConfigQueryOptions: <TData = Awaited<ReturnType<typeof getAiConfig>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAiConfig>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAiConfig>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAiConfigQueryResult = NonNullable<Awaited<ReturnType<typeof getAiConfig>>>;
export type GetAiConfigQueryError = ErrorType<unknown>;
/**
 * @summary Get AI configuration
 */
export declare function useGetAiConfig<TData = Awaited<ReturnType<typeof getAiConfig>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAiConfig>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update AI configuration
 */
export declare const getUpdateAiConfigUrl: () => string;
export declare const updateAiConfig: (aiConfigUpdate: AiConfigUpdate, options?: RequestInit) => Promise<AiConfig>;
export declare const getUpdateAiConfigMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAiConfig>>, TError, {
        data: BodyType<AiConfigUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAiConfig>>, TError, {
    data: BodyType<AiConfigUpdate>;
}, TContext>;
export type UpdateAiConfigMutationResult = NonNullable<Awaited<ReturnType<typeof updateAiConfig>>>;
export type UpdateAiConfigMutationBody = BodyType<AiConfigUpdate>;
export type UpdateAiConfigMutationError = ErrorType<unknown>;
/**
 * @summary Update AI configuration
 */
export declare const useUpdateAiConfig: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAiConfig>>, TError, {
        data: BodyType<AiConfigUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAiConfig>>, TError, {
    data: BodyType<AiConfigUpdate>;
}, TContext>;
/**
 * @summary Chat with AI assistant
 */
export declare const getAiChatUrl: () => string;
export declare const aiChat: (aiMessage: AiMessage, options?: RequestInit) => Promise<AiReply>;
export declare const getAiChatMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof aiChat>>, TError, {
        data: BodyType<AiMessage>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof aiChat>>, TError, {
    data: BodyType<AiMessage>;
}, TContext>;
export type AiChatMutationResult = NonNullable<Awaited<ReturnType<typeof aiChat>>>;
export type AiChatMutationBody = BodyType<AiMessage>;
export type AiChatMutationError = ErrorType<unknown>;
/**
 * @summary Chat with AI assistant
 */
export declare const useAiChat: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof aiChat>>, TError, {
        data: BodyType<AiMessage>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof aiChat>>, TError, {
    data: BodyType<AiMessage>;
}, TContext>;
/**
 * @summary List knowledge base items
 */
export declare const getListKnowledgeItemsUrl: (params?: ListKnowledgeItemsParams) => string;
export declare const listKnowledgeItems: (params?: ListKnowledgeItemsParams, options?: RequestInit) => Promise<KnowledgeItem[]>;
export declare const getListKnowledgeItemsQueryKey: (params?: ListKnowledgeItemsParams) => readonly ["/api/knowledge", ...ListKnowledgeItemsParams[]];
export declare const getListKnowledgeItemsQueryOptions: <TData = Awaited<ReturnType<typeof listKnowledgeItems>>, TError = ErrorType<unknown>>(params?: ListKnowledgeItemsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listKnowledgeItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listKnowledgeItems>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListKnowledgeItemsQueryResult = NonNullable<Awaited<ReturnType<typeof listKnowledgeItems>>>;
export type ListKnowledgeItemsQueryError = ErrorType<unknown>;
/**
 * @summary List knowledge base items
 */
export declare function useListKnowledgeItems<TData = Awaited<ReturnType<typeof listKnowledgeItems>>, TError = ErrorType<unknown>>(params?: ListKnowledgeItemsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listKnowledgeItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create knowledge item
 */
export declare const getCreateKnowledgeItemUrl: () => string;
export declare const createKnowledgeItem: (knowledgeInput: KnowledgeInput, options?: RequestInit) => Promise<KnowledgeItem>;
export declare const getCreateKnowledgeItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createKnowledgeItem>>, TError, {
        data: BodyType<KnowledgeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createKnowledgeItem>>, TError, {
    data: BodyType<KnowledgeInput>;
}, TContext>;
export type CreateKnowledgeItemMutationResult = NonNullable<Awaited<ReturnType<typeof createKnowledgeItem>>>;
export type CreateKnowledgeItemMutationBody = BodyType<KnowledgeInput>;
export type CreateKnowledgeItemMutationError = ErrorType<unknown>;
/**
 * @summary Create knowledge item
 */
export declare const useCreateKnowledgeItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createKnowledgeItem>>, TError, {
        data: BodyType<KnowledgeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createKnowledgeItem>>, TError, {
    data: BodyType<KnowledgeInput>;
}, TContext>;
/**
 * @summary Update knowledge item
 */
export declare const getUpdateKnowledgeItemUrl: (id: number) => string;
export declare const updateKnowledgeItem: (id: number, knowledgeUpdate: KnowledgeUpdate, options?: RequestInit) => Promise<KnowledgeItem>;
export declare const getUpdateKnowledgeItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateKnowledgeItem>>, TError, {
        id: number;
        data: BodyType<KnowledgeUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateKnowledgeItem>>, TError, {
    id: number;
    data: BodyType<KnowledgeUpdate>;
}, TContext>;
export type UpdateKnowledgeItemMutationResult = NonNullable<Awaited<ReturnType<typeof updateKnowledgeItem>>>;
export type UpdateKnowledgeItemMutationBody = BodyType<KnowledgeUpdate>;
export type UpdateKnowledgeItemMutationError = ErrorType<unknown>;
/**
 * @summary Update knowledge item
 */
export declare const useUpdateKnowledgeItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateKnowledgeItem>>, TError, {
        id: number;
        data: BodyType<KnowledgeUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateKnowledgeItem>>, TError, {
    id: number;
    data: BodyType<KnowledgeUpdate>;
}, TContext>;
/**
 * @summary Delete knowledge item
 */
export declare const getDeleteKnowledgeItemUrl: (id: number) => string;
export declare const deleteKnowledgeItem: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteKnowledgeItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteKnowledgeItem>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteKnowledgeItem>>, TError, {
    id: number;
}, TContext>;
export type DeleteKnowledgeItemMutationResult = NonNullable<Awaited<ReturnType<typeof deleteKnowledgeItem>>>;
export type DeleteKnowledgeItemMutationError = ErrorType<unknown>;
/**
 * @summary Delete knowledge item
 */
export declare const useDeleteKnowledgeItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteKnowledgeItem>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteKnowledgeItem>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary List users
 */
export declare const getListUsersUrl: () => string;
export declare const listUsers: (options?: RequestInit) => Promise<User[]>;
export declare const getListUsersQueryKey: () => readonly ["/api/users"];
export declare const getListUsersQueryOptions: <TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listUsers>>>;
export type ListUsersQueryError = ErrorType<unknown>;
/**
 * @summary List users
 */
export declare function useListUsers<TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create user
 */
export declare const getCreateUserUrl: () => string;
export declare const createUser: (userInput: UserInput, options?: RequestInit) => Promise<User>;
export declare const getCreateUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
        data: BodyType<UserInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
    data: BodyType<UserInput>;
}, TContext>;
export type CreateUserMutationResult = NonNullable<Awaited<ReturnType<typeof createUser>>>;
export type CreateUserMutationBody = BodyType<UserInput>;
export type CreateUserMutationError = ErrorType<unknown>;
/**
 * @summary Create user
 */
export declare const useCreateUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createUser>>, TError, {
        data: BodyType<UserInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createUser>>, TError, {
    data: BodyType<UserInput>;
}, TContext>;
/**
 * @summary Update user
 */
export declare const getUpdateUserUrl: (id: number) => string;
export declare const updateUser: (id: number, userUpdate: UserUpdate, options?: RequestInit) => Promise<User>;
export declare const getUpdateUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: number;
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: number;
    data: BodyType<UserUpdate>;
}, TContext>;
export type UpdateUserMutationResult = NonNullable<Awaited<ReturnType<typeof updateUser>>>;
export type UpdateUserMutationBody = BodyType<UserUpdate>;
export type UpdateUserMutationError = ErrorType<unknown>;
/**
 * @summary Update user
 */
export declare const useUpdateUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: number;
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: number;
    data: BodyType<UserUpdate>;
}, TContext>;
/**
 * @summary Delete user
 */
export declare const getDeleteUserUrl: (id: number) => string;
export declare const deleteUser: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
    id: number;
}, TContext>;
export type DeleteUserMutationResult = NonNullable<Awaited<ReturnType<typeof deleteUser>>>;
export type DeleteUserMutationError = ErrorType<unknown>;
/**
 * @summary Delete user
 */
export declare const useDeleteUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteUser>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Sales report
 */
export declare const getGetSalesReportUrl: (params?: GetSalesReportParams) => string;
export declare const getSalesReport: (params?: GetSalesReportParams, options?: RequestInit) => Promise<SalesReport>;
export declare const getGetSalesReportQueryKey: (params?: GetSalesReportParams) => readonly ["/api/reports/sales", ...GetSalesReportParams[]];
export declare const getGetSalesReportQueryOptions: <TData = Awaited<ReturnType<typeof getSalesReport>>, TError = ErrorType<unknown>>(params?: GetSalesReportParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesReport>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSalesReport>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSalesReportQueryResult = NonNullable<Awaited<ReturnType<typeof getSalesReport>>>;
export type GetSalesReportQueryError = ErrorType<unknown>;
/**
 * @summary Sales report
 */
export declare function useGetSalesReport<TData = Awaited<ReturnType<typeof getSalesReport>>, TError = ErrorType<unknown>>(params?: GetSalesReportParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesReport>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Inventory report
 */
export declare const getGetInventoryReportUrl: () => string;
export declare const getInventoryReport: (options?: RequestInit) => Promise<InventoryReport>;
export declare const getGetInventoryReportQueryKey: () => readonly ["/api/reports/inventory"];
export declare const getGetInventoryReportQueryOptions: <TData = Awaited<ReturnType<typeof getInventoryReport>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInventoryReport>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getInventoryReport>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetInventoryReportQueryResult = NonNullable<Awaited<ReturnType<typeof getInventoryReport>>>;
export type GetInventoryReportQueryError = ErrorType<unknown>;
/**
 * @summary Inventory report
 */
export declare function useGetInventoryReport<TData = Awaited<ReturnType<typeof getInventoryReport>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInventoryReport>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Customers report
 */
export declare const getGetCustomersReportUrl: () => string;
export declare const getCustomersReport: (options?: RequestInit) => Promise<CustomersReport>;
export declare const getGetCustomersReportQueryKey: () => readonly ["/api/reports/customers"];
export declare const getGetCustomersReportQueryOptions: <TData = Awaited<ReturnType<typeof getCustomersReport>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCustomersReport>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCustomersReport>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCustomersReportQueryResult = NonNullable<Awaited<ReturnType<typeof getCustomersReport>>>;
export type GetCustomersReportQueryError = ErrorType<unknown>;
/**
 * @summary Customers report
 */
export declare function useGetCustomersReport<TData = Awaited<ReturnType<typeof getCustomersReport>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCustomersReport>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map
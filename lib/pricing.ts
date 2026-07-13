/**
 * Single source of truth for the order price. The backend currently exposes
 * a multi-tier `GET /orders/packages` catalog (basic / premium / exclusive),
 * but none of the tiers gate features on the backend, so the frontend
 * collapses them to a single price.
 *
 * This constant must stay aligned with the backend's `OrderPackage[basic].price`
 * (see `docs/openapi.yaml`, `OrderPackage.price` examples). When the backend
 * catalog is unified, replace this with a single server-sourced value.
 */
export const PACKAGE_PRICE = 99000;

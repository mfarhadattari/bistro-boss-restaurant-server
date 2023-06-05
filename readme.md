# Bistro Boss Restaurant

HOME: https://mfarhad-bistro-boss-restaurant.vercel.app/

# All API:

- Public API:

  - MENUS: https://mfarhad-bistro-boss-restaurant.vercel.app/menu
  - REVIEWS: https://mfarhad-bistro-boss-restaurant.vercel.app/reviews
  - CREATE USER: https://mfarhad-bistro-boss-restaurant.vercel.app/create-users {user info in body}

- User API:

  - USER CART: https://mfarhad-bistro-boss-restaurant.vercel.app/user/carts {take user email in query and jwt token in header}
  - SAVE TO CART: https://mfarhad-bistro-boss-restaurant.vercel.app/user/add-to-carts {cart items info in body with user email}
  - DELETE FROM CART: https://mfarhad-bistro-boss-restaurant.vercel.app/user/delete-from-carts {item id by params}
  - PAYMENT INTENT: https://mfarhad-bistro-boss-restaurant.vercel.app/user/create-payment-intent {price in body , token in headers}
  - PAYMENT INTENT: https://mfarhad-bistro-boss-restaurant.vercel.app/user/payment-confirmation {payment info in body, token in header}

- Admin API:

  - ALL USER: https://mfarhad-bistro-boss-restaurant.vercel.app/admin/all-users {admin email in query and admin token in header}
  - MAKE ADMIN: https://mfarhad-bistro-boss-restaurant.vercel.app/admin/make-admin {user id as pram}
  - ADD ITEM: https://mfarhad-bistro-boss-restaurant.vercel.app/admin/add-item {admin email in query and admin token in header and data in body}
  - REMOVE ITEM: https://mfarhad-bistro-boss-restaurant.vercel.app/admin/delete-item {admin email in query and admin token in header and id in param}
  - REMOVE ITEM: https://mfarhad-bistro-boss-restaurant.vercel.app/admin/payment-info {admin email in query and admin token in header}

- Other API:

  - GENERATE TOKEN: https://mfarhad-bistro-boss-restaurant.vercel.app/jwt {user email in body}
  - CHECK ADMIN: https://mfarhad-bistro-boss-restaurant.vercel.app/check-admin {user email in query and user token in header}

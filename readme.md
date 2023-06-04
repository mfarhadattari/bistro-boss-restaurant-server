# Bistro Boss Restaurant

HOME: https://mfarhad-bistro-boss-restaurant.vercel.app/

# All API:

- Public API:

  - MENUS: https://mfarhad-bistro-boss-restaurant.vercel.app/menu
  - REVIEWS: https://mfarhad-bistro-boss-restaurant.vercel.app/reviews

- Security API:

  - GENERATE TOKEN: https://mfarhad-bistro-boss-restaurant.vercel.app/jwt {user email in body}
  - CHECK ADMIN: https://mfarhad-bistro-boss-restaurant.vercel.app/user/admin {user email in query and user token in header}

- User API:

  - CREATE USER: https://mfarhad-bistro-boss-restaurant.vercel.app/users {user info in body}
  - SAVE TO CART: https://mfarhad-bistro-boss-restaurant.vercel.app/carts {cart items info in body with user email}
  - DELETE FROM CART: https://mfarhad-bistro-boss-restaurant.vercel.app/carts {item id by params}
  - USER CART: https://mfarhad-bistro-boss-restaurant.vercel.app/carts {take user email in query and jwt token in header}

- Admin API:

  - MAKE ADMIN: https://mfarhad-bistro-boss-restaurant.vercel.app/users/admin {user id as pram}
  - ALL USER: https://mfarhad-bistro-boss-restaurant.vercel.app/all-users {admin email in query and admin token in header}
  - ADD ITEM: https://mfarhad-bistro-boss-restaurant.vercel.app/add-item {admin email in query and admin token in header and data in body}
  - REMOVE ITEM: https://mfarhad-bistro-boss-restaurant.vercel.app/delete-item {admin email in query and admin token in header and id in param}

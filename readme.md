# Bistro Boss Restaurant

# All API:

- Public API:

  - MENUS: http://localhost:5000/menu
  - REVIEWS: http://localhost:5000/reviews

- Security API:

  - GENERATE TOKEN: http://localhost:5000/jwt {user email in body}
  - CHECK ADMIN: http://localhost:5000/user/admin {user email in query and user token in header}

- User API:

  - CREATE USER: http://localhost:5000/users {user info in body}
  - SAVE TO CART: http://localhost:5000/carts {cart items info in body with user email}
  - DELETE FROM CART: http://localhost:5000/carts {item id by params}
  - USER CART: http://localhost:5000/carts {take user email in query and jwt token in header}

- Admin API:

  - MAKE ADMIN: http://localhost:5000/users/admin {user id as param}
  - ALL USER: http://localhost:5000/all-users {admin email in query and admin token in header}
  - ADD ITEM: http://localhost:5000/add-item {admin email in query and admin token in header and data in body}
  - DELETE ITEM: http://localhost:5000/delete-item {item id as param,admin email in query and admin token in header and data in body}

PRODUCT
-------

id
name

COLOR
-----

id
product_id
name

SIZE
----

id
product_id
name
price

INVENTORY
---------

id
product_id
color_id
size_id
quantity
updated_at

TRANSACTION
-----------

id
date
buyer_name
subtotal
discount
total

TRANSACTION_ITEM
----------------

id
transaction_id
product_id
color_id
size_id
quantity
unit_price
total

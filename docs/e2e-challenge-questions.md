# End-to-End Challenge Questions

This document contains a set of plain-English questions designed to test the specific business rules and semantic mappings captured in the `datacontract.yml`. An AI assistant powered by the MCP server should be able to answer these questions correctly.

### **Challenge Questions & Expected Outcomes**

1.  **Question:** "Show me the Customer Name for the customer with ID 4."
    * **Purpose:** Tests a simple mapping from `cust_mst.c_name` to "Customer Name" using a valid ID from the seed data.
    * **Expected Outcome:** Should return `customer d`.
    * **Expected SQL:** `SELECT c_name FROM cust_mst WHERE c_id = '4'`

2.  **Question:** "Which sales orders are cancelled?"
    * **Purpose:** Tests the business rule mapping for `so_hdr.ord_stat` where 'Cancelled' correctly corresponds to the integer code `5`.
    * **Expected Outcome:** Should return order ID `1003`.
    * **Expected SQL:** `SELECT ord_id FROM so_hdr WHERE ord_stat = 'cancelled'`

3.  **Question:** "What is the name of the product with ID 102?"
    * **Purpose:** Tests a query for a specific column value based on a product ID.
    * **Expected Outcome:** Should return `Product Y`.
    * **Expected SQL:** `SELECT p_name FROM prod WHERE p_id = '102'`
    * **Note:** This test is currently disabled because the query builder logic does not yet support queries on the `prod` table.

---

*The following questions are currently out of scope for a simple test runner as they may require join support.*

4.  **Question:** "What was the quantity of each product sold in order number 1001?"
    * **Purpose:** Tests the ability to join `trans` and `prod` and understand the relationship between an order and its transaction lines using a valid ID.
    * **Expected Outcome:** Should return quantities for 'Product X' (2) and 'Product Y' (1).
    * **Expected SQL:** `SELECT T2.p_name, T1.quantity FROM trans AS T1 JOIN prod AS T2 ON T1.p_id = T2.p_id WHERE T1.ord_id = 1001;`

5.  **Question:** "Find the name of the customer who placed order number 1004."
    * **Purpose:** Tests a join between `cust_mst` and `so_hdr` to link a customer name to a specific order using a valid ID.
    * **Expected Outcome:** Should return `Customer C with special chars !@#$%^&*()`.
    * **Expected SQL:** `SELECT c.c_name FROM cust_mst c JOIN so_hdr s ON c.c_id = s.c_id WHERE s.ord_id = 1004;`
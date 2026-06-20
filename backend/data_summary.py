import sqlite3
import pandas as pd

def main():
    conn = sqlite3.connect('backend/valueforge.db')
    
    # 1. Count of products per category x price tier
    df_products = pd.read_sql_query("""
        SELECT category_code, price_tier, count(*) as product_count
        FROM competitor_products
        GROUP BY category_code, price_tier
        ORDER BY category_code, price_tier
    """, conn)
    
    print("=== Count of Products per Category x Price Tier ===")
    print(df_products.to_string(index=False))
    print("\n")
    
    # 2. Claim frequency distribution across tiers
    # For each category, price_tier, claim_code -> count of products with that claim
    # Then join with total products in that category, price_tier to get %
    
    query = """
    SELECT category_code, price_tier, claim_codes
    FROM competitor_products
    """
    import json
    df_claims_raw = pd.read_sql_query(query, conn)
    
    # explode the claim_codes
    records = []
    for _, row in df_claims_raw.iterrows():
        try:
            claims = json.loads(row['claim_codes'])
        except:
            claims = row['claim_codes'] if isinstance(row['claim_codes'], list) else []
        for claim in claims:
            records.append({'category_code': row['category_code'], 'price_tier': row['price_tier'], 'claim_code': claim})
    
    df_exploded = pd.DataFrame(records)
    
    tier_totals = df_claims_raw.groupby(['category_code', 'price_tier']).size().reset_index(name='total_products')
    claim_counts = df_exploded.groupby(['category_code', 'price_tier', 'claim_code']).size().reset_index(name='claim_count')
    
    df_claims = pd.merge(claim_counts, tier_totals, on=['category_code', 'price_tier'])
    df_claims['percentage'] = (df_claims['claim_count'] / df_claims['total_products'] * 100).round(1)
    df_claims = df_claims.sort_values(['category_code', 'price_tier', 'percentage'], ascending=[True, True, False])
    
    print("=== Claim Distribution per Category & Tier ===")
    
    categories = df_claims['category_code'].unique()
    for cat in categories:
        print(f"\n--- Category: {cat} ---")
        df_cat = df_claims[df_claims['category_code'] == cat]
        tiers = df_cat['price_tier'].unique()
        for tier in tiers:
            print(f"  Tier: {tier} (Total Products: {df_cat[df_cat['price_tier'] == tier]['total_products'].iloc[0]})")
            df_tier = df_cat[df_cat['price_tier'] == tier]
            for _, row in df_tier.iterrows():
                print(f"    - {row['claim_code'].ljust(20)}: {row['claim_count']} ({row['percentage']}%)")
    
    conn.close()

if __name__ == "__main__":
    main()

from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Test Dashboard
    print("=== Testando Dashboard ===")
    page.goto('http://localhost:3000/')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='/tmp/dashboard.png', full_page=True)
    print("Dashboard loaded, screenshot saved")
    
    # Check for errors in console
    console_logs = []
    page.on("console", lambda msg: console_logs.append(msg.text))
    
    # Test Leads page
    print("\n=== Testando Leads ===")
    page.goto('http://localhost:3000/leads')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='/tmp/leads.png', full_page=True)
    print("Leads page loaded")
    
    # Test Pipeline page
    print("\n=== Testando Pipeline ===")
    page.goto('http://localhost:3000/pipeline')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='/tmp/pipeline.png', full_page=True)
    print("Pipeline page loaded")
    
    # Test Secretaria page
    print("\n=== Testando Secretaria ===")
    page.goto('http://localhost:3000/secretaria')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='/tmp/secretaria.png', full_page=True)
    print("Secretaria page loaded")
    
    print("\n=== CONSOLE ERRORS ===")
    for log in console_logs:
        if "error" in log.lower():
            print(log)
    
    browser.close()
    print("\n=== Teste Concluído ===")
from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3001")

        # Wait for the main content to load (preloader to disappear)
        # We look for the "inhale" text which is initially present in the Marquee
        try:
            page.wait_for_selector('text="вдох"', timeout=15000)
            print("Found 'вдох' text.")
        except Exception as e:
            print(f"Timeout waiting for 'вдох': {e}")
            page.screenshot(path="debug_timeout.png")
            browser.close()
            return

        # Take a screenshot of the inhale state
        page.screenshot(path="marquee_inhale.png")
        print("Captured inhale state: marquee_inhale.png")

        # The exhale phase comes after the inhale. The text changes to words like "сила", "гибкость".
        # We wait for one of these words.
        try:
            # Check for any of the exhale words
            # The component cycles through words. "сила" is usually first or early.
            # Let's wait for a change in text content of the marquee.
            # Or just wait 5 seconds (inhale is 4s)
            time.sleep(5)
            page.screenshot(path="marquee_exhale.png")
            print("Captured exhale state (time-based): marquee_exhale.png")
        except Exception as e:
            print(f"Error waiting for exhale state: {e}")

        browser.close()

if __name__ == "__main__":
    run()

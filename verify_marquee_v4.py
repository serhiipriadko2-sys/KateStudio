from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3001")

        # Wait for the main content to load (preloader to disappear)
        print("Waiting for Marquee section...")
        try:
            # Wait for the section with the specific aria-label
            # The preloader might take a while, so we give it 30s.
            marquee_section = page.wait_for_selector('section[aria-label="Дыхательная практика: вдох и качество"]', state="visible", timeout=30000)
            print("Found Marquee section.")
        except Exception as e:
            print(f"Timeout waiting for Marquee section: {e}")
            page.screenshot(path="debug_timeout.png")
            browser.close()
            return

        # Scroll to it to ensure it's in view (lazy loading etc)
        marquee_section.scroll_into_view_if_needed()

        # We want to capture 'вдох' (inhale). It cycles every 4 seconds.
        print("Waiting for 'вдох' in Marquee...")
        try:
            # Wait for the text "вдох" to appear in the h2
            page.wait_for_selector('section[aria-label="Дыхательная практика: вдох и качество"] h2:has-text("вдох")', timeout=10000)
            print("Found 'вдох'. Taking screenshot.")
            time.sleep(0.5) # Brief pause for animation frame
            page.screenshot(path="marquee_inhale_final.png")
        except Exception as e:
             print(f"Could not find 'вдох': {e}")
             # It might be in exhale phase, we can wait.
             # If we missed it, we might be in a loop.

        # Now wait for exhale.
        print("Waiting for exhale state...")
        try:
            # Wait for text that is NOT "вдох".
            # We can just wait 4.5 seconds which is > half cycle.
            time.sleep(4.5)

            # Take another screenshot
            page.screenshot(path="marquee_exhale_final.png")

            # Verify text
            element = page.query_selector('section[aria-label="Дыхательная практика: вдох и качество"] h2')
            if element:
                text = element.text_content()
                print(f"Current text is: {text}")
                if text != "вдох":
                    print("Exhale state verified.")
                else:
                    print("Warning: Still stuck on 'вдох'?")
        except Exception as e:
             print(f"Error checking exhale: {e}")

        browser.close()

if __name__ == "__main__":
    run()

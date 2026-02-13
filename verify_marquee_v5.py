from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3001")

        # Wait for preloader to finish
        print("Waiting for preloader to disappear...")
        try:
            # Wait for the text "Вдох..." which is in the preloader to be detached
            # Also wait for "Выдох" as preloader might show that too.
            page.wait_for_selector('text="Вдох..."', state="detached", timeout=60000)
            # Give it a moment to fully clear
            time.sleep(1)
            print("Preloader disappeared.")
        except Exception as e:
            print(f"Preloader still present or timed out: {e}")
            page.screenshot(path="debug_preloader_stuck.png")

        # Wait for the main content to load
        print("Waiting for Marquee section...")
        try:
            # Wait for the section with the specific aria-label
            marquee_section = page.wait_for_selector('section[aria-label="Дыхательная практика: вдох и качество"]', state="visible", timeout=30000)
            print("Found Marquee section.")
        except Exception as e:
            print(f"Timeout waiting for Marquee section: {e}")
            page.screenshot(path="debug_timeout.png")
            browser.close()
            return

        # Scroll to it
        marquee_section.scroll_into_view_if_needed()

        # We want to capture 'вдох' (inhale). It cycles every 4 seconds.
        print("Waiting for 'вдох' in Marquee...")
        try:
            # Wait for the text "вдох" to appear in the h2
            page.wait_for_selector('section[aria-label="Дыхательная практика: вдох и качество"] h2:has-text("вдох")', timeout=20000)
            print("Found 'вдох'. Taking screenshot.")
            time.sleep(0.5) # Ensure animation is stable
            page.screenshot(path="marquee_inhale_final.png")
        except Exception as e:
             print(f"Could not find 'вдох': {e}")

        # Now wait for exhale.
        print("Waiting for exhale state (text change)...")
        try:
            # Wait for text to change from "вдох"
            # We can loop and check every 0.5s for up to 10s
            changed = False
            for _ in range(20):
                element = page.query_selector('section[aria-label="Дыхательная практика: вдох и качество"] h2')
                if element:
                    text = element.text_content()
                    if text != "вдох":
                        print(f"Text changed to: {text}")
                        page.screenshot(path="marquee_exhale_final.png")
                        changed = True
                        break
                time.sleep(0.5)

            if not changed:
                print("Timeout waiting for text change.")
                # Debug dump
                page.screenshot(path="debug_stuck_inhale.png")

        except Exception as e:
             print(f"Error checking exhale: {e}")

        browser.close()

if __name__ == "__main__":
    run()

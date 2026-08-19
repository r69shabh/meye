# ==============================================================================
# Selenium Webdriver Example (Python)
# Description: Demonstrates Selenium usage for automated testing, fulfilling 
#              the "Selenium/Appium" requirement in the Snabbit JD.
# Prerequisites: pip install selenium webdriver-manager
# ==============================================================================

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import unittest

class MeyeAppSeleniumTest(unittest.TestCase):
    def setUp(self):
        # Initialize the Chrome driver (assumes local testing)
        options = webdriver.ChromeOptions()
        options.add_argument('--headless') # Run in headless mode for CI/CD
        self.driver = webdriver.Chrome(options=options)
        self.driver.implicitly_wait(10)

    def test_app_loads_and_has_correct_title(self):
        driver = self.driver
        driver.get("http://localhost:5173") # Assuming Vite dev server
        
        # Verify title
        self.assertIn("meye", driver.title.lower(), "App title should contain 'meye'")

    def test_github_login_button_presence(self):
        driver = self.driver
        driver.get("http://localhost:5173")
        
        try:
            # Wait for either the main input or the login button to load
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.XPATH, "//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'github')] | //input"))
            )
        except Exception as e:
            self.fail(f"Could not load the main application UI elements: {e}")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from typing import Tuple, Dict
import argparse
import time

# Chrome WebDriver 경로 설정 (본인의 환경에 맞게 수정)
WEBDRIVER_PATH = './chromedriver'
OPTIONS = webdriver.ChromeOptions()
OPTIONS.add_argument('--start-maximized')  # 브라우저 창 최대화


def init_driver() -> webdriver.Chrome:
    # Chrome WebDriver 인스턴스 생성
    driver = webdriver.Chrome(executable_path=WEBDRIVER_PATH, options=OPTIONS)

    return driver


def login_skku(driver: webdriver.Chrome, user_id: str, user_pwd: str) -> webdriver.Chrome:
    """_summary_
    성균관대 홈페이지 로그인
    Args:
        driver (webdriver.Chrome): WebDriver 인스턴스
        user_id (str): 로그인할 사용자 ID
        user_pwd (str): 로그인할 사용자 비밀번호

    Returns:
        driver (webdriver.Chrome): WebDriver 인스턴스
    """
    # print(user_id, user_pwd)
    driver.get('https://eportal.skku.edu')

    user_id_input = driver.find_element('id', 'userid')
    user_pwd_input = driver.find_element('id', 'userpwd')

    user_id_input.send_keys(user_id)
    user_pwd_input.send_keys(user_pwd)

    user_pwd_input.send_keys(Keys.RETURN)
    time.sleep(5)

    return driver


def enter_gls(driver: webdriver.Chrome) -> webdriver.Chrome:
    """_summary_
    GLS 페이지로 이동
    Args:
        driver (webdriver.Chrome): WebDriver 인스턴스

    Returns:
        driver (webdriver.Chrome): WebDriver 인스턴스
    """
    driver.get('https://eportal.skku.edu/wps/myportal/std')
    driver.implicitly_wait(1000)
    element = driver.find_element(By.XPATH, '//a[@title="GLS"]')
    element.click()
    driver.switch_to.window(driver.window_handles[-1])

    return driver


def open_reservation_popup(driver: webdriver.Chrome) -> webdriver.Chrome:
    """_summary_
    공간대여신청 (예약신청) 팝업창 열기
    Args:
        driver (webdriver.Chrome): _description_

    Returns:
        webdriver.Chrome: _description_
    """
    wait = WebDriverWait(driver, 10)
    btn = wait.until(EC.presence_of_element_located(
        (By.ID, 'mainframe.TopFrame.form.divFrame.form.divTop.form.divTop.form.btnM532010000:icontext')))
    btn.click()
    btn = wait.until(EC.presence_of_element_located(
        (By.ID, 'mainframe.TopFrame.form.divFrame.form.divTop.form.divPopupMenuM532010000.form.divMain.form.divMenuM532011100.form.btnMenuM000011122:icontext')))
    btn.click()
    btn = wait.until(EC.presence_of_element_located(
        (By.CLASS_NAME, 'btn_WF_mainGrn')))
    btn.click()

    return driver


def available_space(driver: webdriver.Chrome, t_from: str, t_to: str) -> None:

    pass


def submit_reservation_form(driver: webdriver.Chrome) -> None:
    # 여기서부터 추가
    pass


def argparsing() -> argparse.Namespace:
    """_summary_
    crawling에 필요한 정보 입력받고 파싱
    Returns:
        argparse.Namespace: {
            user_id: str,
            user_pwd: str,
            start_t: str,
            end_t: str
        }
    """
    parser = argparse.ArgumentParser()
    parser.add_argument('--user_id', '-i', type=str, required=False)
    parser.add_argument('--user_pwd', '-p', type=str, required=False)
    parser.add_argument('--start_t', '-s', type=str, required=False)
    parser.add_argument('--end_t', '-e', type=str, required=False)

    args = parser.parse_args()
    return args


def main():
    args = argparsing()
    driver = init_driver()

    login_skku(driver, args.user_id, args.user_pwd)
    enter_gls(driver)
    open_reservation_popup(driver)
    # available_space(driver, args.start_t, args.end_t)
    # submit_reservation_form(driver, ...)

    time.sleep(60)
    driver.quit()

    return


if __name__ == "__main__":
    main()

import os
import time
import json
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client

# Supabase setup
SUPABASE_URL = "https://eunxcwqjdqqawdijxzcl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bnhjd3FqZHFxYXdkaWp4emNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODQwMDU1NCwiZXhwIjoyMDUzOTc2NTU0fQ.zSyXlZypQCRAiVy6WdT3hxGws16_19lmGiWDfrvNN_k"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("scraper.py loaded") # Added log

def scrape_jobs():
    print("Starting job scraping...")
    base_url = "https://www.linkedin.com/jobs/search/?keywords=Software%20Engineer&location=India&start="
    all_jobs = []
    for page in range(0, 25, 25):
        url = base_url + str(page)
        print(f"Scraping page: {url}")
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            job_cards = soup.find_all('div', class_='base-card relative w-full hover:shadow-sm hover:bg-color-background-container-hover base-search-card base-search-card--link base-search-card--list')
            for card in job_cards:
                title_element = card.find('h3', class_='base-search-card__title')
                company_element = card.find('h4', class_='base-search-card__subtitle')
                location_element = card.find('span', class_='job-search-card__location')
                link_element = card.find('a', class_='base-card__full-link')
                if title_element and company_element and location_element and link_element:
                    job_title = title_element.text.strip()
                    company_name = company_element.text.strip()
                    job_location = location_element.text.strip()
                    job_link = link_element['href']
                    job_details = scrape_job_details(job_link)
                    if job_details:
                        all_jobs.append({
                            'title': job_title,
                            'company': company_name,
                            'location': job_location,
                            'link': job_link,
                            **job_details
                        })
        else:
            print(f"Failed to fetch page {page}, status code: {response.status_code}")
        time.sleep(2)
    return all_jobs

def scrape_job_details(job_url):
    try:
        response = requests.get(job_url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            description_element = soup.find('div', class_='description__text description__text--rich')
            if description_element:
                description = description_element.text.strip()
                skills = extract_skills(description)
                return {'description': description, 'skills': skills}
            else:
                print(f"Description not found for {job_url}")
                return None
        else:
            print(f"Failed to fetch job details for {job_url}, status code: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error scraping job details for {job_url}: {e}")
        return None

def extract_skills(description):
    skills = ["JavaScript", "React", "Node.js", "Python", "Java", "C++", "HTML", "CSS", "SQL", "MongoDB", "AWS", "Docker", "Kubernetes", "Git"]
    found_skills = [skill for skill in skills if skill.lower() in description.lower()]
    return found_skills

def upload_to_supabase(jobs):
    print("Uploading jobs to Supabase...")
    for job in jobs:
        try:
            data, count = supabase.table("jobs").insert(job).execute()
            if count:
                print(f"Uploaded job: {job.get('title', 'No Title')}")
            else:
                print(f"Failed to upload job: {job.get('title', 'No Title')}")
        except Exception as e:
            print(f"Error uploading job {job.get('title', 'No Title')}: {e}")

if __name__ == "__main__":
    scraped_jobs = scrape_jobs()
    if scraped_jobs:
        upload_to_supabase(scraped_jobs)
        print("Job scraping and upload complete.")
    else:
        print("No jobs were scraped.")

"""
Example of a basic web scraper using requests and BeautifulSoup.
"""
import requests
from bs4 import BeautifulSoup
import logging
import urllib.parse
from typing import Dict, List, Union, Optional, Any
import time
import random


class BasicScraper:
    """Base class for web scraping with common methods."""
    
    def __init__(self, base_url: str, headers: Optional[Dict[str, str]] = None):
        """
        Initialize the scraper.
        
        Args:
            base_url: Base URL for the scraper
            headers: Custom HTTP headers
        """
        self.base_url = base_url
        self.headers = headers or {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.session = requests.Session()
        self._setup_logging()
        
        # Optional rate limiting
        self.rate_limit = False
        self.min_delay = 1  # Minimum delay between requests (seconds)
        self.max_delay = 3  # Maximum delay between requests (seconds)
        self.last_request_time = 0
    
    def _setup_logging(self) -> None:
        """Set up the logging system."""
        self.logger = logging.getLogger(self.__class__.__name__)
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)
    
    def enable_rate_limiting(self, min_delay: float = 1.0, max_delay: float = 3.0) -> None:
        """
        Enable rate limiting for requests to be more respectful to servers.
        
        Args:
            min_delay: Minimum delay between requests in seconds
            max_delay: Maximum delay between requests in seconds
        """
        self.rate_limit = True
        self.min_delay = min_delay
        self.max_delay = max_delay
        self.logger.info(f"Rate limiting enabled: {min_delay}-{max_delay}s between requests")
    
    def _apply_rate_limiting(self) -> None:
        """Apply rate limiting if enabled."""
        if not self.rate_limit:
            return
            
        now = time.time()
        elapsed = now - self.last_request_time
        
        if elapsed < self.min_delay:
            delay = self.min_delay + random.uniform(0, self.max_delay - self.min_delay)
            self.logger.debug(f"Rate limiting: sleeping for {delay:.2f}s")
            time.sleep(delay)
        
        self.last_request_time = time.time()
    
    def get_page(self, url: str) -> Optional[BeautifulSoup]:
        """
        Get and parse the content of a page.
        
        Args:
            url: URL of the page to fetch
            
        Returns:
            BeautifulSoup object or None if error occurs
        """
        try:
            # Validate URL
            parsed = urllib.parse.urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                self.logger.error(f"Invalid URL: {url}")
                return None
                
            # Apply rate limiting if enabled
            self._apply_rate_limiting()
            
            # Make the request
            self.logger.info(f"Fetching page: {url}")
            response = self.session.get(
                url, 
                headers=self.headers, 
                timeout=30,
                allow_redirects=True
            )
            response.raise_for_status()
            
            # Parse with BeautifulSoup
            soup = BeautifulSoup(response.text, 'html.parser')
            self.logger.info(f"Successfully fetched page: {url}")
            return soup
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error fetching page {url}: {str(e)}")
            return None
        except Exception as e:
            self.logger.error(f"Unexpected error fetching {url}: {str(e)}")
            return None
    
    def resolve_url(self, base_url: str, relative_url: Optional[str]) -> Optional[str]:
        """
        Resolve relative URLs to absolute URLs.
        
        Args:
            base_url: Base URL for resolution
            relative_url: Relative URL to resolve
            
        Returns:
            Absolute URL or None for invalid inputs
        """
        if not relative_url:
            return None
            
        try:
            return urllib.parse.urljoin(base_url, relative_url)
        except Exception as e:
            self.logger.warning(f"Error resolving URL {relative_url} with base {base_url}: {str(e)}")
            return None
    
    def extract_data(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """
        Extract data from a BeautifulSoup object.
        
        Args:
            soup: BeautifulSoup object of the page
            
        Returns:
            List of dictionaries with extracted data
        """
        # Must be implemented by subclasses
        raise NotImplementedError("The extract_data method must be implemented by subclasses")


class NewsScraper(BasicScraper):
    """Specialized scraper for news sites."""
    
    def extract_data(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """
        Extract titles and links of news articles.
        
        Args:
            soup: BeautifulSoup object of the page
            
        Returns:
            List of dictionaries with titles and links
        """
        articles = []
        for article in soup.select('article'):
            title_elem = article.select_one('h2') or article.select_one('h3')
            link_elem = article.select_one('a')
            
            if title_elem and link_elem:
                title = title_elem.get_text(strip=True)
                link = link_elem.get('href')
                
                # Resolve relative URLs
                if link:
                    link = self.resolve_url(self.base_url, link)
                
                # Get description if available
                description_elem = article.select_one('p') or article.select_one('.description')
                description = description_elem.get_text(strip=True) if description_elem else None
                
                # Get date if available
                date_elem = article.select_one('.date') or article.select_one('time')
                date = date_elem.get_text(strip=True) if date_elem else None
                
                # Get image if available
                img_elem = article.select_one('img')
                img_url = None
                if img_elem and img_elem.get('src'):
                    img_url = self.resolve_url(self.base_url, img_elem.get('src'))
                
                if title and link:
                    articles.append({
                        'title': title,
                        'link': link,
                        'description': description,
                        'date': date,
                        'image_url': img_url
                    })
        
        self.logger.info(f"Extracted {len(articles)} articles")
        return articles


def example_usage():
    """Example usage of the news scraper."""
    # Replace with a real news site URL
    scraper = NewsScraper('https://example-news-site.com')
    
    # Enable rate limiting to be respectful
    scraper.enable_rate_limiting(2.0, 5.0)
    
    # Fetch and parse the page
    soup = scraper.get_page('https://example-news-site.com/latest')
    
    if soup:
        # Extract articles
        articles = scraper.extract_data(soup)
        
        # Display the first 5 articles
        for i, article in enumerate(articles[:5], 1):
            print(f"{i}. {article['title']} - {article['link']}")
            if article['description']:
                print(f"   {article['description'][:100]}...")
            print()


if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Run the example
    example_usage() 
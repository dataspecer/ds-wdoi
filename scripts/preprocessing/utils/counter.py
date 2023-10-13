class Counter:
    def __init__(self) -> None:
        self.counter = 0
    
    def inc(self):
        self.counter += 1

    def get_count(self):
        return self.counter
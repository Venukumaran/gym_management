package gym.demo.controller;
import java.time.LocalDate;
import java.util.List;

import gym.demo.entity.member;
import gym.demo.service.memberService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
public class gymController {

    private final memberService service;

    public gymController(memberService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<member>create(@RequestBody member data) {
        member savedData = service.addMember(data);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedData);
    }

    @GetMapping
    public ResponseEntity<Page<member>> getAll(

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        return ResponseEntity.ok(
                service.getAll(page, size)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<member>updateMember(@PathVariable Long id,@RequestBody member data){
        return ResponseEntity.ok(service.updates(id,data));
    }

    @GetMapping("/{id}")
public ResponseEntity <member> getbyID(@PathVariable Long id){
        return ResponseEntity.ok(service.getById(id));

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(
            @PathVariable Long id) {

        service.deleteMember(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<member>> searchMembers(
            @RequestParam String name) {

        return ResponseEntity.ok(
                service.searchByName(name)
        );
    }

    // FILTER STATUS
    @GetMapping("/status")
    public ResponseEntity<List<member>> filterByStatus(
            @RequestParam String status) {

        return ResponseEntity.ok(
                service.filterByStatus(status)
        );
    }

    // FILTER PLAN
    @GetMapping("/plan")
    public ResponseEntity<List<member>> filterByPlan(
            @RequestParam String plan) {

        return ResponseEntity.ok(
                service.filterByPlan(plan)
        );
    }


    // Gender filter
    @GetMapping("/gender")
    public ResponseEntity<List<member>> getByGender(
            @RequestParam String gender) {

        return ResponseEntity.ok(service.getByGender(gender));
    }

    // Exact age
    @GetMapping("/age")
    public ResponseEntity<List<member>> getByAge(
            @RequestParam int age) {

        return ResponseEntity.ok(service.getByAge(age));
    }

    // Age range
    @GetMapping("/age-range")
    public ResponseEntity<List<member>> getByAgeRange(
            @RequestParam int minAge,
            @RequestParam int maxAge) {

        return ResponseEntity.ok(
                service.getByAgeRange(minAge, maxAge)
        );
    }

    // Recent joinees
    @GetMapping("/recent")
    public ResponseEntity<List<member>> getRecentJoinees(
            @RequestParam LocalDate date) {

        return ResponseEntity.ok(
                service.getRecentJoinees(date)
        );
    }

    // Expiring soon
    @GetMapping("/expiring")
    public ResponseEntity<List<member>> getExpiringMembers(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {

        return ResponseEntity.ok(
                service.getExpiringMembers(startDate, endDate)
        );
    }
}

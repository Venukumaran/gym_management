package gym.demo.service;
import java.time.LocalDate;
import java.util.List;

import gym.demo.exception.ResourceNotFoundException;
import gym.demo.repositary.memberRepositary;
import gym.demo.entity.member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class memberService {
    private final memberRepositary repo;

    public memberService(memberRepositary repo){
        this.repo=repo;
    }
    //create
    public member addMember(member data){
        return repo.save(data);
    }
    //getall
    public Page<member> getAll(int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        return repo.findAll(pageable);
    }

    //getBYID

    public member getById(Long id){
        return repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Member not found with id: " + id)
                );
    }

    public member updates(Long id,member newMember){
        member existingMember=repo.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("Member not found with id: " + id)
        );
        existingMember.setName(newMember.getName());
        existingMember.setEmail(newMember.getEmail());
        existingMember.setAge(newMember.getAge());
        existingMember.setGender(newMember.getGender());

        return repo.save(existingMember);
    }


    public void deleteMember(Long id) {

        member existingMember = repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Member not found with id: " + id)
                );

        repo.delete(existingMember);
    }
    // SEARCH
    public List<member> searchByName(String name) {
        return repo.findByNameContainingIgnoreCase(name);
    }

    // FILTER STATUS
    public List<member> filterByStatus(String status) {
        return repo.findByStatusIgnoreCase(status);
    }

    // FILTER PLAN
    public List<member> filterByPlan(String plan) {
        return repo.findByMembershipPlanIgnoreCase(plan);
    }


    // Gender filter
    public List<member> getByGender(String gender) {
        return repo.findByGenderIgnoreCase(gender);
    }

    // Exact age
    public List<member> getByAge(int age) {
        return repo.findByAge(age);
    }

    // Age range
    public List<member> getByAgeRange(int minAge, int maxAge) {
        return repo.findByAgeBetween(minAge, maxAge);
    }

    // Recent joinees
    public List<member> getRecentJoinees(LocalDate date) {
        return repo.findByJoiningDateAfter(date);
    }

    // Expiring soon
    public List<member> getExpiringMembers(LocalDate startDate, LocalDate endDate) {
        return repo.findByExpiryDateBetween(startDate, endDate);
    }


}
